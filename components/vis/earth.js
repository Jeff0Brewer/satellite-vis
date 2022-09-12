import { mat4 } from 'gl-matrix'
import getIcosphere from '../../lib/icosphere.js'
import { getEpochYear, getEpochDay } from '../../lib/shared-epoch.js'
import * as Glu from '../../lib/gl-help.js'

const floatSize = Float32Array.BYTES_PER_ELEMENT

const setupGl = async (gl, epoch) => {
    const vertPath = './shaders/earth-vert.glsl'
    const fragPath = './shaders/earth-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const earthRadius = 6371
    const { vertices, triangles } = getIcosphere(3)
    vertices = vertices.map(
        vertex => vertex.map(
            val => val*earthRadius
        )
    )
    let icoBuffer = []
    triangles.forEach(triangle => {
        triangle.forEach(vertex => {
            icoBuffer.push(...vertices[vertex])
        })
    })
    const buffer = Glu.initBuffer(gl, new Float32Array(icoBuffer), gl.STATIC_DRAW)
    const numVertex = icoBuffer.length / 3

    const locations = {}
    locations['aPosition'] = Glu.initAttribute(gl, 'aPosition', 3, 3, 0, false, floatSize)
    locations['uModelMatrix'] = gl.getUniformLocation(gl.program, 'uModelMatrix')
    locations['uViewMatrix'] = gl.getUniformLocation(gl.program, 'uViewMatrix')

    gl.uniform1i(gl.getUniformLocation(gl.program, 'uEarthMap'), 0)
    const texture = Glu.createCubemap(gl, 1024, [
        './earth-cubemap/posx.png', './earth-cubemap/negx.png',
        './earth-cubemap/posy.png', './earth-cubemap/negy.png',
        './earth-cubemap/posz.png', './earth-cubemap/negz.png'
    ], [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ])

    const offsetEpoch = {
        year: getEpochYear(epoch),
        day: getEpochDay(epoch)
    }

    return {
        program: program,
        buffer: buffer,
        texture: texture,
        locations: locations,
        numVertex: numVertex,
        offsetEpoch: offsetEpoch
    }
}

const updateProjMatrix = (gl, projMatrix, ref) => {
    if (ref?.program) {
        Glu.switchShader(gl, ref.program)
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
    }
}

const getRotationMatrix = (epoch, ref) => {
    if (!ref?.program) return
    const { offsetEpoch } = ref

    const dt = (getEpochYear(epoch) - offsetEpoch.year)/365 + (getEpochDay(epoch) - offsetEpoch.day)
    return mat4.fromZRotation(mat4.create(), dt * 2*Math.PI)
}

const draw = (gl, viewMatrix, modelMatrix, earthRotation, epoch, ref) => {
    if (!ref?.program) return
    const { program, buffer, texture, locations, numVertex, offsetEpoch } = ref
    const earthModelMat = mat4.multiply(mat4.create(), modelMatrix, earthRotation)
    
    Glu.switchShader(gl, program)
    gl.uniformMatrix4fv(locations.uModelMatrix, false, earthModelMat)
    gl.uniformMatrix4fv(locations.uViewMatrix, false, viewMatrix)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
    gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 3 * floatSize, 0)
    gl.drawArrays(gl.TRIANGLES, 0, numVertex)
}

export {
    setupGl,
    updateProjMatrix,
    getRotationMatrix,
    draw
}
