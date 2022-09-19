import { mat4 } from 'gl-matrix'
import * as Glu from '../../lib/gl-help.js'

const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT
const categoryColors = {
    'Resource': [1, 1, .6],
    'Communications': [1, .8, 1],
    'Navigation': [.8, .8, 1],
    'Scientific': [.8, 1, .8],
    'Debris': [.6, .6, .6],
    'Misc': [1, 1, 1]
}

const updateBuffer = (gl, data, ref) => {
    if (ref?.program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, ref.posBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.length*3), gl.DYNAMIC_DRAW)

        const colors = new Float32Array(data.length*3)
        data.forEach((item, i) => {
            const color = categoryColors[item.category]
            colors.set(color, i*3)
        })
        gl.bindBuffer(gl.ARRAY_BUFFER, ref.colBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

        ref.numVertex = data.length
    }
    return ref
}

const setupGl = async (gl, numVertex) => {
    const vertPath = './shaders/satellite-vert.glsl'
    const fragPath = './shaders/satellite-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const posBuffer = Glu.initBuffer(gl, new Float32Array(numVertex*3), gl.DYNAMIC_DRAW)
    const colBuffer = Glu.initBuffer(gl, new Float32Array(numVertex*3), gl.STATIC_DRAW)

    const locations = {}
    locations['aPosition'] = Glu.initAttribute(gl, 'aPosition', 3, 3, 0, false, FLOAT_SIZE)
    locations['aColor'] = Glu.initAttribute(gl, 'aColor', 3, 3, 0, false, FLOAT_SIZE)
    locations['uModelMatrix'] = gl.getUniformLocation(gl.program, 'uModelMatrix')
    locations['uViewMatrix'] = gl.getUniformLocation(gl.program, 'uViewMatrix')

    return {
        program: program,
        posBuffer: posBuffer,
        colBuffer: colBuffer,
        locations: locations,
        numVertex: numVertex
    }
}

const updateProjMatrix = (gl, projMatrix, ref) => {
    if (ref?.program) {
        Glu.switchShader(gl, ref.program)
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
    }
}

const draw = (gl, viewMatrix, modelMatrix, positions, ref) => {
    if (!ref?.program) return
    const { program, posBuffer, colBuffer, locations, numVertex } = ref

    Glu.switchShader(gl, program)

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions)
    gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer)
    gl.vertexAttribPointer(locations.aColor, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0)

    gl.uniformMatrix4fv(locations.uModelMatrix, false, modelMatrix)
    gl.uniformMatrix4fv(locations.uViewMatrix, false, viewMatrix)
    gl.drawArrays(gl.POINTS, 0, numVertex)

}

export {
    setupGl,
    updateProjMatrix,
    updateBuffer,
    draw
}
