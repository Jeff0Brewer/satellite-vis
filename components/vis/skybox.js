import { mat4, vec3 } from 'gl-matrix'
import * as Glu from '../../lib/gl-help.js'

const floatSize = Float32Array.BYTES_PER_ELEMENT

const setupGl = async (gl, viewMatrix) => {
    const vertPath = './shaders/skybox-vert.glsl'
    const fragPath = './shaders/skybox-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const positions = [
        -1, -1,  1, -1, 
        -1,  1, -1,  1,
         1, -1,  1,  1
    ]
    const buffer = Glu.initBuffer(gl, new Float32Array(positions), gl.STATIC_DRAW)
    const numVertex = positions.length / 2

    const locations = {}
    locations['aPosition'] = Glu.initAttribute(gl, 'aPosition', 2, 2, 0, false, floatSize)
    locations['uViewProjInverse'] = gl.getUniformLocation(gl.program, 'uViewProjInverse')
    gl.uniform1i(gl.getUniformLocation(gl.program, 'uSkybox'), 0)
    const texture = Glu.createCubemap(gl, 1024, [
        './galaxy-cubemap/posx.png', './galaxy-cubemap/negx.png',
        './galaxy-cubemap/posy.png', './galaxy-cubemap/negy.png',
        './galaxy-cubemap/posz.png', './galaxy-cubemap/negz.png'
    ], [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ])

    const angleOffset = mat4.fromXRotation(mat4.create(), 60.2 * Math.PI/180)

    return {
        program: program,
        buffer: buffer,
        texture: texture,
        locations: locations,
        numVertex: numVertex,
        viewMatrix: viewMatrix,
        projMatrix: mat4.create(),
        angleOffset: angleOffset
    }
}

const updateProjMatrix = (projMatrix, ref) => {
    if (ref?.projMatrix) {
        ref.projMatrix = projMatrix
    }
    return ref
}

const getInvMatrix = (viewMatrix, projMatrix, modelMatrix, angleOffset) => {
    const invView = mat4.multiply(mat4.create(),
        mat4.invert(mat4.create(),
            viewMatrix
        ),
        mat4.multiply(mat4.create(),
            modelMatrix,
            angleOffset
        )
    )
    invView[12] = 0
    invView[13] = 0
    invView[14] = 0
    return mat4.invert(mat4.create(),
        mat4.multiply(mat4.create(),
            projMatrix,
            invView
        )
    )
}

const draw = (gl, modelMatrix, ref) => {
    if (!ref?.program) return
    const { program, buffer, texture, locations, numVertex, viewMatrix, projMatrix, angleOffset } = ref
    
    Glu.switchShader(gl, program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
    gl.uniformMatrix4fv(locations.uViewProjInverse, false, getInvMatrix(viewMatrix, projMatrix, modelMatrix, angleOffset))
    gl.vertexAttribPointer(locations.aPosition, 2, gl.FLOAT, false, 2 * floatSize, 0)

    gl.disable(gl.DEPTH_TEST)
    gl.drawArrays(gl.TRIANGLES, 0, numVertex)
    gl.enable(gl.DEPTH_TEST)
}

export {
    setupGl,
    updateProjMatrix,
    draw
}
