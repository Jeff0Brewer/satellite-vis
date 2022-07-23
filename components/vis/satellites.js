import { mat4 } from 'gl-matrix'
import { propagate } from 'satellite.js'
import * as Glu from '../../lib/gl-help.js'

const byteSize = Float32Array.BYTES_PER_ELEMENT

const setupGl = async (gl, data, scale, viewMatrix) => {
    const vertPath = './shaders/satellite-vert.glsl'
    const fragPath = './shaders/satellite-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const buffer = Glu.initBuffer(gl, new Float32Array(data.length*3), gl.DYNAMIC_DRAW)

    const locations = {}
    locations['aPosition'] = Glu.initAttribute(gl, 'aPosition', 3, 3, 0, false, byteSize)
    locations['uModelMatrix'] = gl.getUniformLocation(gl.program, 'uModelMatrix')
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uViewMatrix'), false, viewMatrix)
    gl.uniform1f(gl.getUniformLocation(gl.program, 'uScale'), scale*1000)

    return {
        program: program,
        buffer: buffer,
        locations: locations
    }
}

const updateProjMatrix = (gl, program, projMatrix) => {
    if (!program) return
    Glu.switchShader(gl, program)
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
}

const draw = (gl, data, epoch, modelMatrix, glVars) => {
    if (!glVars?.program) return

    const visData = new Float32Array(data.length*3)
    data.forEach((satRecord, i) => {
        const { position } = propagate(satRecord, epoch)
        if (satRecord.error) return
        visData[3*i] = position.x
        visData[3*i+1] = position.y
        visData[3*i+2] = position.z
    })

    const { program, buffer, locations } = glVars
    Glu.switchShader(gl, program)
    gl.uniformMatrix4fv(locations.uModelMatrix, false, modelMatrix)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, visData, gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 3*byteSize, 0)
    gl.drawArrays(gl.POINTS, 0, data.length)

}

export {
    setupGl,
    updateProjMatrix,
    draw
}
