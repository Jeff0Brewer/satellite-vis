// load shader from string, returns promise
const loadShader = (gl, type, path) => {
    return fetch(path)
        .then(res => res.text())
        .then(source => {
            const shader = gl.createShader(type)
            gl.shaderSource(shader, source)
            gl.compileShader(shader)
            return shader
        })
        .catch(err => console.log(err))
}

// create program from shaders
const createProgram = (gl, vertShader, fragShader) => {
    const program = gl.createProgram()
    gl.attachShader(program, vertShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)
    return program
}

// switch current program
const switchShader = (gl, program) => {
    gl.useProgram(program)
    gl.program = program
}

// initialize vertex attribute
const initAttribute = (gl, name, size, stride, offset, normalized, byteSize) => {
    const location = gl.getAttribLocation(gl.program, name)
    gl.vertexAttribPointer(location, size, gl.FLOAT, normalized, stride * byteSize, offset * byteSize)
    gl.enableVertexAttribArray(location)
    return location
}

// initialize buffer with data
const initBuffer = (gl, data, drawType) => {
    const glBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, drawType)
    return glBuffer
}

export {
    loadShader,
    createProgram,
    switchShader,
    initAttribute,
    initBuffer
}
