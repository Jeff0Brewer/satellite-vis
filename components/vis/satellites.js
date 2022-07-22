import { mat4 } from 'gl-matrix'
import * as Glu from '../../lib/gl-help.js'

const keplerianAttribs = [
    'aAxis', 'aEccentricity', 'aPeriapsis', 
    'aLngAcendingNode', 'aInclination', 'aAnomaly', 
    'aYear', 'aDay', 'aSecond'
]
const keplerianProperties = [
    'axis', 'eccentricity', 'periapsis',
    'lngAcendingNode', 'inclination', 'anomaly',
    'year', 'day', 'second'
]
const byteSize = Float32Array.BYTES_PER_ELEMENT

const updateBuffer = (gl, buffer, data) => {
    if (!buffer) return
    let visData = []
    data.forEach(keplerian => {
        keplerianProperties.forEach(property => {
            visData.push(keplerian[property])
        })
    })
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(visData), gl.STATIC_DRAW)
    const numVertex = visData.length / keplerianAttribs.length
    return numVertex
}

const setupGl = async (gl, data, scale, viewMatrix) => {
    const vertPath = './shaders/satellite-vert.glsl'
    const fragPath = './shaders/satellite-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const buffer = gl.createBuffer()
    const numVertex = updateBuffer(gl, buffer, data)

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
