import { mat4, vec4, vec3 } from 'gl-matrix'
import * as Glu from '../../lib/gl-help.js'
import { byteToHex, hexToByte } from '../../lib/hex.js'

const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT
const categoryColors = {
    'Resource': [1, 1, .6],
    'Communications': [1, .8, 1],
    'Navigation': [.8, .8, 1],
    'Scientific': [.8, 1, .8],
    'Debris': [.6, .6, .6],
    'Misc': [1, 1, 1]
}
const selectColors = []
for (let r = 0; r < 40; r++) {
    for (let g = 0; g < 40; g++) {
        for (let b = 0; b < 40; b++) {
            const hex = byteToHex([210 + r, 210 + g, 210 + b])
            selectColors.push(hex)
        }
    }
}

const setupGl = async (gl, numVertex) => {
    const vertPath = './shaders/satellite-vert.glsl'
    const fragPath = './shaders/satellite-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const posBuffer = Glu.initBuffer(gl, new Float32Array(numVertex*3), gl.DYNAMIC_DRAW)
    const colBuffer = Glu.initBuffer(gl, new Float32Array(numVertex*3*2), gl.STATIC_DRAW)

    const locations = {}
    locations['aPosition'] = Glu.initAttribute(gl, 'aPosition', 3, 3, 0, false, FLOAT_SIZE)
    locations['aColor'] = Glu.initAttribute(gl, 'aColor', 3, 6, 0, false, FLOAT_SIZE)
    locations['aSelectColor'] = Glu.initAttribute(gl, 'aSelectColor', 3, 6, 3, false, FLOAT_SIZE)
    locations['uModelMatrix'] = gl.getUniformLocation(gl.program, 'uModelMatrix')
    locations['uViewMatrix'] = gl.getUniformLocation(gl.program, 'uViewMatrix')
    locations['uInvMatrix'] = gl.getUniformLocation(gl.program, 'uInvMatrix')
    locations['uMousePos'] = gl.getUniformLocation(gl.program, 'uMousePos')

    return {
        program: program,
        posBuffer: posBuffer,
        colBuffer: colBuffer,
        locations: locations,
        numVertex: numVertex
    }
}

const updateBuffer = (gl, data, ref) => {
    if (ref?.program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, ref.posBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.length*3), gl.DYNAMIC_DRAW)

        const colors = new Float32Array(data.length*3*2)
        data.forEach((item, i) => {
            const color = categoryColors[item.category]
            colors.set(color, i*3*2)
            const select = hexToByte(selectColors[i]).map(byte => byte/255)
            colors.set(select, 3 + i*3*2)
        })
        gl.bindBuffer(gl.ARRAY_BUFFER, ref.colBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)

        ref.numVertex = data.length
    }
    return ref
}

const updateProjMatrix = (gl, projMatrix, ref) => {
    if (ref?.program) {
        Glu.switchShader(gl, ref.program)
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
    }
}

const updateMousePos = (gl, mouseX, mouseY, modelRef, viewRef, projRef, ref) => {
    if (ref?.program) {
        const { locations, program } = ref
        Glu.switchShader(gl, program)
        const mvpMat = mat4.multiply(mat4.create(),
            mat4.multiply(mat4.create(),
                projRef.current,
                viewRef.current
            ),
            modelRef.current
        )
        const invMat =  mat4.invert(mat4.create(), mvpMat)
        gl.uniformMatrix4fv(locations.uInvMatrix, false, invMat)
        gl.uniform2f(locations.uMousePos, 2*mouseX/innerWidth - 1, -(2*mouseY/innerHeight - 1))
    }
}

const draw = (gl, viewMatrix, modelMatrix, positions, ref) => {
    if (ref?.program) {
        const { program, posBuffer, colBuffer, locations, numVertex } = ref

        Glu.switchShader(gl, program)

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
    updateMousePos,
    updateProjMatrix,
    updateBuffer,
    selectColors,
    draw
}
