import { mat4 } from 'gl-matrix'
import * as Glu from '../../lib/gl-help.js'

const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT

// init required variables
const setupGl = async (gl) => {
    // load program from shader files
    const vertPath = './shaders/skybox-vert.glsl'
    const fragPath = './shaders/skybox-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    // buffer static positions to fill viewport
    const posBuffer = new Float32Array([
        -1, -1, 1, -1,
        -1, 1, -1, 1,
        1, -1, 1, 1
    ])
    const buffer = Glu.initBuffer(gl, posBuffer, gl.STATIC_DRAW)

    // store num vertices for draw
    const numVertex = posBuffer.length / 2

    // get shader locations, set texture location
    const locations = {}
    locations.aPosition = Glu.initAttribute(gl, 'aPosition', 2, 2, 0, false, FLOAT_SIZE)
    locations.uViewProjInverse = gl.getUniformLocation(gl.program, 'uViewProjInverse')
    gl.uniform1i(gl.getUniformLocation(gl.program, 'uSkybox'), 0)

    // init galaxy cubemap texture
    const texture = Glu.createCubemap(gl, 1024, [
        './galaxy-cubemap/posx.png', './galaxy-cubemap/negx.png',
        './galaxy-cubemap/posy.png', './galaxy-cubemap/negy.png',
        './galaxy-cubemap/posz.png', './galaxy-cubemap/negz.png'
    ], [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ])

    // set rotation matrix for galaxy rotation relative to earth orbital plane
    const angleOffset = mat4.fromXRotation(mat4.create(), 60.2 * Math.PI / 180)

    // return ref of all required variables
    return {
        program,
        buffer,
        texture,
        locations,
        numVertex,
        projMatrix: mat4.create(),
        angleOffset
    }
}

// store projection matrix to calculate inverse view proj matrix
const updateProjMatrix = (projMatrix, ref) => {
    if (ref) {
        ref.projMatrix = projMatrix
    }
    return ref
}

// calculate inverse view proj matrix to convert positions to cubemap normals
const getInvMatrix = (viewMatrix, projMatrix, modelMatrix, angleOffset) => {
    const lookMatrix = mat4.multiply(mat4.create(),
        viewMatrix,
        mat4.multiply(mat4.create(),
            modelMatrix,
            angleOffset
        )
    )
    // set matrix translation to 0
    lookMatrix[12] = 0
    lookMatrix[13] = 0
    lookMatrix[14] = 0
    return mat4.invert(mat4.create(),
        mat4.multiply(mat4.create(),
            projMatrix,
            lookMatrix
        )
    )
}

// update uniforms and draw
const draw = (gl, viewMatrix, modelMatrix, ref) => {
    if (ref) {
        const { program, buffer, texture, locations, numVertex, projMatrix, angleOffset } = ref

        Glu.switchShader(gl, program)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.vertexAttribPointer(locations.aPosition, 2, gl.FLOAT, false, 2 * FLOAT_SIZE, 0)
        gl.uniformMatrix4fv(locations.uViewProjInverse, false, getInvMatrix(viewMatrix, projMatrix, modelMatrix, angleOffset))

        gl.disable(gl.DEPTH_TEST)
        gl.drawArrays(gl.TRIANGLES, 0, numVertex)
        gl.enable(gl.DEPTH_TEST)
    }
}

export {
    setupGl,
    updateProjMatrix,
    draw
}
