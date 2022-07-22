import * as Glu from '../lib/gl-help.js'
import getIcosphere from '../lib/icosphere.js'

const byteSize = Float32Array.BYTES_PER_ELEMENT

const initEarthShader = async (gl, viewMatrix) => {
    const vertPath = './shaders/earth-vert.glsl'
    const fragPath = './shader/earth-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const aPosition = Glu.initAttribute(gl, 'aPosition', 3, 3, 0, false, byteSize)
    const uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix')

    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uViewMatrix'), false, viewMatrix)
    gl.uniform1i(gl.getUniformLocation(gl.program, 'uEarthMap'), 0)
    createCubemap(gl, 1024, [
        './earth-cubemap/posx.png', './earth-cubemap/negx.png',
        './earth-cubemap/posy.png', './earth-cubemap/negy.png',
        './earth-cubemap/posz.png', './earth-cubemap/negz.png'
    ], [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ])
    return {
        program: program,
        locations: {
            position: aPosition,
            modelMatrix: uModelMatrix
        }
    }
}

const initEarthBuffer = (gl, scale) => {
    const earthRadius = 6371000
    const { vertices, triangles } = getIcosphere(3)
    vertices = vertices.map(
        vertex => vertex.map(
            val => val*scale*earthRadius
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
    return {
        buffer: buffer,
        numVertex: numVertex
    }
}

const setupGl = async (gl, scale, viewMatrix) => {
    const shaderInit = initEarthShader(gl, viewMatrix)
    const { buffer, numVertex } = initEarthBuffer(gl, scale)
    const { program, locations } = await shaderInit
    return {
        program: program,
        buffer: buffer,
        locations: locations,
        numVertex: numVertex
    }
}

const updateProjMatrix = (gl, program, projMatrix) => {
    Glu.switchShader(program)
    gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
}

const draw = (gl, epochDelta, modelMatrix, program, buffer, locations, numVertex) => {
    const earthRotation = mat4.fromZRotation(mat4.create(), epochDelta/86400 * 2*Math.PI)
    const earthModelMat = mat4.multiply(mat4.create(), modelMatrix, earthRotation)
    
    Glu.switchShader(gl, program)
    gl.uniformMatrix4fv(locations.modelMatrix, false, earthModelMat)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 3 * byteSize, 0)
    gl.drawArrays(gl.TRIANGLES, 0, numVertex)
}

export {
    setupGl,
    updateProjMatrix,
    draw
}
