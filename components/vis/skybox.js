import * as Glu from '../../lib/gl-help.js'

const setupGl (gl, viewMatrix) => {
    const positions = [
        -1, -1,  1, -1, 
        -1,  1, -1,  1,
         1, -1,  1,  1
    ]
    const buffer = Glu.initBuffer(gl, new Float32Array(positions), gl.STATIC_DRAW)
}

export {
    setupGl
}
