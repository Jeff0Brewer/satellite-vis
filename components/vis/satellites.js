import { mat4 } from 'gl-matrix'
import * as Glu from '../../lib/gl-help.js'
import { byteToHex, hexToByte } from '../../lib/hex.js'
import { getScreenDimensions } from '../../lib/dimensions.js'

// map satellite category to point color
const categoryColors = {
    Resource: [1, 1, 0.6],
    Communications: [1, 0.8, 1],
    Navigation: [0.7, 0.7, 1],
    Scientific: [0.7, 1, 0.7],
    Debris: [0.7, 0.7, 0.7],
    Misc: [1, 1, 1]
}

// list of unique colors for determining satellite id on click
const selectColors = []
for (let r = 0; r < 40; r++) {
    for (let g = 0; g < 40; g++) {
        for (let b = 0; b < 40; b++) {
            const hex = byteToHex([210 + r, 210 + g, 210 + b])
            selectColors.push(hex)
        }
    }
}
const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT

// init required variables
const setupGl = async (gl, numVertex) => {
    // load program from shader files
    const vertPath = './shaders/satellite-vert.glsl'
    const fragPath = './shaders/satellite-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    // init empty position and color buffers
    const posBuffer = Glu.initBuffer(gl, new Float32Array(numVertex * 3), gl.DYNAMIC_DRAW)
    const colBuffer = Glu.initBuffer(gl, new Float32Array(numVertex * 3 * 2), gl.STATIC_DRAW)

    // get shader locations
    const locations = {}
    locations.aPosition = Glu.initAttribute(gl, 'aPosition', 3, 3, 0, false, FLOAT_SIZE)
    locations.aColor = Glu.initAttribute(gl, 'aColor', 3, 6, 0, false, FLOAT_SIZE)
    locations.aSelectColor = Glu.initAttribute(gl, 'aSelectColor', 3, 6, 3, false, FLOAT_SIZE)
    locations.uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix')
    locations.uViewMatrix = gl.getUniformLocation(gl.program, 'uViewMatrix')
    locations.uInvMatrix = gl.getUniformLocation(gl.program, 'uInvMatrix')
    locations.uMousePos = gl.getUniformLocation(gl.program, 'uMousePos')

    // return ref of all required variables
    return {
        program,
        posBuffer,
        colBuffer,
        locations,
        numVertex,
        projMatrix: mat4.create()
    }
}

// update position buffer size and color buffer values on data change
const updateBuffer = (gl, data, ref) => {
    if (ref) {
        // resize position buffer to fit data
        gl.bindBuffer(gl.ARRAY_BUFFER, ref.posBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.length * 3), gl.DYNAMIC_DRAW)

        // buffer new color values from data
        const colors = new Float32Array(data.length * 3 * 2)
        data.forEach((item, i) => {
            const categoryColor = categoryColors[item.category]
            colors.set(categoryColor, i * 3 * 2)
            const selectColor = hexToByte(selectColors[i]).map(byte => byte / 255)
            colors.set(selectColor, 3 + i * 3 * 2)
        })
        gl.bindBuffer(gl.ARRAY_BUFFER, ref.colBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)

        // get reference to data length for draw
        ref.numVertex = data.length
    }
    return ref
}

// update viewport variables on change, store ref to projection matrix
const updateProjMatrix = (gl, projMatrix, ref) => {
    if (ref) {
        Glu.switchShader(gl, ref.program)
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
        ref.projMatrix = projMatrix
        const { height } = getScreenDimensions()
        const pointSize = Math.max(0.0045 * height, 3)
        gl.uniform1f(gl.getUniformLocation(gl.program, 'uPointSize'), pointSize)
    }
    return ref
}

// get inverse mvp matrix for unprojecting mouse position
const getInvMat = (projMatrix, viewMatrix, modelMatrix) => {
    const mvpMat = mat4.multiply(mat4.create(),
        mat4.multiply(mat4.create(),
            projMatrix,
            viewMatrix
        ),
        modelMatrix
    )
    return mat4.invert(mat4.create(), mvpMat)
}

// update uniforms and draw
const draw = (gl, viewMatrix, modelMatrix, positions, mousePos, ref) => {
    if (ref) {
        const { program, posBuffer, colBuffer, locations, numVertex, projMatrix } = ref

        Glu.switchShader(gl, program)

        const { width, height } = getScreenDimensions()
        gl.uniform2f(locations.uMousePos, 2 * mousePos.x / width - 1, -(2 * mousePos.y / height - 1))
        gl.uniformMatrix4fv(locations.uInvMatrix, false, getInvMat(projMatrix, viewMatrix, modelMatrix))

        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions)
        gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer)
        gl.vertexAttribPointer(locations.aColor, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0)
        gl.vertexAttribPointer(locations.aSelectColor, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE)

        gl.uniformMatrix4fv(locations.uModelMatrix, false, modelMatrix)
        gl.uniformMatrix4fv(locations.uViewMatrix, false, viewMatrix)
        gl.drawArrays(gl.POINTS, 0, numVertex)
    }
}

export {
    setupGl,
    updateProjMatrix,
    updateBuffer,
    selectColors,
    draw
}
