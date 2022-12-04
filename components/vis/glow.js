import * as Glu from '../../lib/gl-help.js'
import { mat4, vec3 } from 'gl-matrix'

const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT

// init required variables
const setupGl = async (gl, scale) => {
    // load program from shader files
    const vertPath = './shaders/glow-vert.glsl'
    const fragPath = './shaders/glow-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const sz = scale * 6371 * 1.08 // > earth radius
    const quad = [
        sz, 0, -sz, 1, -1,
        -sz, 0, -sz, -1, -1,
        sz, 0, sz, 1, 1,
        -sz, 0, -sz, -1, -1,
        -sz, 0, sz, 1, -1,
        sz, 0, sz, 1, 1
    ]

    const buffer = Glu.initBuffer(gl, new Float32Array(quad), gl.STATIC_DRAW)
    const locations = {}
    locations.aPosition = Glu.initAttribute(gl, 'aPosition', 3, 5, 0, false, FLOAT_SIZE)
    locations.aTexCoord = Glu.initAttribute(gl, 'aTexCoord', 2, 5, 3, false, FLOAT_SIZE)
    locations.uViewMatrix = gl.getUniformLocation(gl.program, 'uViewMatrix')
    locations.uProjMatrix = gl.getUniformLocation(gl.program, 'uProjMatrix')

    // return ref of all required variables
    return {
        program,
        buffer,
        locations
    }
}

// update proj matrix on window resize
const updateProjMatrix = (gl, projMatrix, ref) => {
    if (ref) {
        Glu.switchShader(gl, ref.program)
        gl.uniformMatrix4fv(ref.locations.uProjMatrix, false, projMatrix)
    }
}

// update uniforms and draw
const draw = (gl, viewMatrix, ref) => {
    if (ref) {
        const { program, buffer, locations } = ref

        const viewDist = vec3.length(mat4.getTranslation(vec3.create(), viewMatrix))
        const zoomMatrix = mat4.lookAt(mat4.create(),
            [0, viewDist, 0],
            [0, 0, 0],
            [0, 0, 1]
        )

        Glu.switchShader(gl, program)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 5 * FLOAT_SIZE, 0)
        gl.vertexAttribPointer(locations.aTexCoord, 2, gl.FLOAT, false, 5 * FLOAT_SIZE, 3 * FLOAT_SIZE)
        gl.uniformMatrix4fv(locations.uViewMatrix, false, zoomMatrix)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
}

export {
    setupGl,
    updateProjMatrix,
    draw
}
