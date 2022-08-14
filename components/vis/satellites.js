import { mat4 } from 'gl-matrix'
import * as Glu from '../../lib/gl-help.js'

const floatSize = Float32Array.BYTES_PER_ELEMENT

const updateBuffer = (gl, numVertex, ref) => {
    if (ref?.buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, ref.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(numVertex*3), gl.DYNAMIC_DRAW)
        ref.numVertex = numVertex
    }
    return ref
}

const setupGl = async (gl, numVertex, scale, viewMatrix) => {
    const vertPath = './shaders/satellite-vert.glsl'
    const fragPath = './shaders/satellite-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const buffer = Glu.initBuffer(gl, new Float32Array(numVertex*3), gl.DYNAMIC_DRAW)

    const aPosition = Glu.initAttribute(gl, 'aPosition', 3, 3, 0, false, floatSize)
    const uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix')
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uViewMatrix'), false, viewMatrix)

    return {
        program: program,
        buffer: buffer,
        locations: {
            aPosition: aPosition,
            uModelMatrix: uModelMatrix
        },
        numVertex: numVertex
    }
}

const updateProjMatrix = (gl, projMatrix, ref) => {
    if (ref?.program) {
        Glu.switchShader(gl, ref.program)
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
    }
}

const draw = (gl, positions, modelMatrix, ref) => {
    if (!ref?.program) return
    const { program, buffer, locations, numVertex } = ref
    Glu.switchShader(gl, program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions)
    gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 3 * floatSize, 0)
    gl.uniformMatrix4fv(locations.uModelMatrix, false, modelMatrix)
    gl.drawArrays(gl.POINTS, 0, numVertex)

}

export {
    setupGl,
    updateProjMatrix,
    updateBuffer,
    draw
}
