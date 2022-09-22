import { mat4, vec3 } from 'gl-matrix'
import { propagate, eciToGeodetic, gstime } from 'satellite.js'
import { getSunPosition } from '../../lib/sun.js'
import getIcosphere from '../../lib/icosphere.js'
import * as Glu from '../../lib/gl-help.js'

const lightingMap = {
    ON: 1,
    OFF: 0
}
const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT

const setupGl = async (gl, epoch, lighting) => {
    const vertPath = './shaders/earth-vert.glsl'
    const fragPath = './shaders/earth-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    let { vertices, triangles } = getIcosphere(3)
    const earthRadius = 6371
    vertices = vertices.map(vert => vert.map(val => val * earthRadius))
    const icoBuffer = new Float32Array(triangles.length * 9)
    triangles.forEach((triangle, ti) =>
        triangle.forEach((vertex, vi) =>
            vertices[vertex].forEach((val, i) => {
                icoBuffer[ti * 9 + vi * 3 + i] = val
            })
        )
    )
    const buffer = Glu.initBuffer(gl, icoBuffer, gl.STATIC_DRAW)

    const locations = {}
    locations.aPosition = Glu.initAttribute(gl, 'aPosition', 3, 3, 0, false, FLOAT_SIZE)
    locations.uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix')
    locations.uViewMatrix = gl.getUniformLocation(gl.program, 'uViewMatrix')
    locations.uSunNormal = gl.getUniformLocation(gl.program, 'uSunNormal')
    locations.uLighting = gl.getUniformLocation(gl.program, 'uLighting')
    gl.uniform1i(locations.uLighting, lightingMap[lighting])
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

    return {
        program,
        buffer,
        texture,
        locations,
        numVertex: icoBuffer.length / 3,
        epoch,
        offsetEpoch: epoch[0],
        rotationOffset: -1
    }
}

const updateProjMatrix = (gl, projMatrix, ref) => {
    if (ref) {
        Glu.switchShader(gl, ref.program)
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
    }
}

const updateRotationOffset = (satrec, ref) => {
    if (ref) {
        const date = new Date(ref.offsetEpoch)
        const { position } = propagate(satrec, date)
        const { x, y } = position
        const { longitude } = eciToGeodetic(position, gstime(date))
        let currAngle = Math.acos(x / Math.sqrt(x * x + y * y))
        if (y < 0) { currAngle = 2 * Math.PI - currAngle }
        const lng = longitude + Math.PI
        const offset = currAngle - lng
        ref.rotationOffset = offset
    }
    return ref
}

const updateLighting = (gl, val, ref) => {
    if (ref) {
        Glu.switchShader(gl, ref.program)
        gl.uniform1i(ref.locations.uLighting, lightingMap[val])
    }
}

const getRotationMatrix = (epoch, ref) => {
    if (ref) {
        const dt = (epoch - ref.offsetEpoch) / 86400000
        return mat4.fromZRotation(mat4.create(), dt * 2 * Math.PI + ref.rotationOffset)
    }
}

const draw = (gl, viewMatrix, modelMatrix, earthRotation, ref) => {
    if (ref) {
        const { program, buffer, texture, locations, numVertex, epoch } = ref
        const earthModelMat = mat4.multiply(mat4.create(), modelMatrix, earthRotation)
        const sunNormal = vec3.normalize(vec3.create(),
            vec3.transformMat4(vec3.create(),
                getSunPosition(epoch[0]),
                mat4.invert(mat4.create(), earthRotation)
            )
        )

        Glu.switchShader(gl, program)
        gl.uniform3fv(locations.uSunNormal, sunNormal)
        gl.uniformMatrix4fv(locations.uModelMatrix, false, earthModelMat)
        gl.uniformMatrix4fv(locations.uViewMatrix, false, viewMatrix)

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0)
        gl.drawArrays(gl.TRIANGLES, 0, numVertex)
    }
}

export {
    setupGl,
    updateProjMatrix,
    updateRotationOffset,
    updateLighting,
    getRotationMatrix,
    draw
}
