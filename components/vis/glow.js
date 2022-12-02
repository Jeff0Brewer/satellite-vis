import * as Glu from '../../lib/gl-help.js'

const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT

// init required variables
const setupGl = async (gl) => {
    // load program from shader files
    const vertPath = './shaders/glow-vert.glsl'
    const fragPath = './shaders/glow-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const buffer = Glu.initBuffer(gl, new Float32Array([0, 0, 0]), gl.STATIC_DRAW)
    const locations = {}
    locations.aPosition = Glu.initAttribute(gl, 'aPosition', 3, 3, 0, false, FLOAT_SIZE)
    locations.uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix')
    locations.uViewMatrix = gl.getUniformLocation(gl.program, 'uViewMatrix')
    locations.uProjMatrix = gl.getUniformLocation(gl.program, 'uProjMatrix')
    locations.uScreenHeight = gl.getUniformLocation(gl.program, 'uScreenHeight')

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
        gl.uniform1f(ref.locations.uScreenHeight, visualViewport.height * devicePixelRatio)
    }
}

// update uniforms and draw
const draw = (gl, viewMatrix, modelMatrix, ref) => {
    if (ref) {
        const { program, buffer, locations } = ref

        Glu.switchShader(gl, program)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0)
        gl.uniformMatrix4fv(locations.uModelMatrix, false, modelMatrix)
        gl.uniformMatrix4fv(locations.uViewMatrix, false, viewMatrix)
        gl.drawArrays(gl.POINTS, 0, 1)
    }
}

export {
    setupGl,
    updateProjMatrix,
    draw
}
