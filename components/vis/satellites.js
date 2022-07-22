import { mat4 } from 'gl-matrix'
import keplerianAttribs from '../../models/keplerAttrib.js'
import * as Glu from '../../lib/gl-help.js'

const byteSize = Float32Array.BYTES_PER_ELEMENT

const setupGl = async (gl, data, scale, viewMatrix) => {
    const vertPath = './shaders/satellite-vert.glsl'
    const fragPath = './shaders/satellite-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const buffer = Glu.initBuffer(gl, data, gl.STATIC_DRAW)
    const numVertex = data.length / keplerianAttribs.length

    const locations = {}
    keplerianAttribs.forEach((att, i) => {
        locations[att] = Glu.initAttribute(gl, att, 1, keplerianAttribs.length, i, false, byteSize)
    })
    locations['uYear'] = gl.getUniformLocation(gl.program, 'uYear')
    locations['uDay'] = gl.getUniformLocation(gl.program, 'uDay')
    locations['uSecond'] = gl.getUniformLocation(gl.program, 'uSecond')
    locations['uModelMatrix'] = gl.getUniformLocation(gl.program, 'uModelMatrix')

    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uViewMatrix'), false, viewMatrix)
    gl.uniform1f(gl.getUniformLocation(gl.program, 'uScale'), scale)

    return {
        program: program,
        buffer: buffer,
        locations: locations,
        numVertex: numVertex
    }
}

const updateProjMatrix = (gl, program, projMatrix) => {
    if (!program) return
    Glu.switchShader(gl, program)
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
}

const updateBuffer = (gl, buffer, data) => {
    if (!buffer) return
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    const numVertex = data.length / keplerianAttribs.length
    return numVertex
}

const draw = (gl, epoch, modelMatrix, glVars) => {
    if (!glVars?.program) return
    const { program, buffer, locations, numVertex } = glVars
    Glu.switchShader(gl, program)
    gl.uniform1f(locations.uYear, epoch.year)
    gl.uniform1f(locations.uDay, epoch.day)
    gl.uniform1f(locations.uSecond, epoch.second)
    gl.uniformMatrix4fv(locations.uModelMatrix, false, modelMatrix)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    const stride = keplerianAttribs.length * byteSize
    keplerianAttribs.forEach((att, i) => { 
        gl.vertexAttribPointer(locations[att], 1, gl.FLOAT, false, stride, i * byteSize)
    })
    gl.drawArrays(gl.POINTS, 0, numVertex)

}

export {
    setupGl,
    updateProjMatrix,
    updateBuffer,
    draw
}
