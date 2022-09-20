import { mat4, vec4, vec3 } from 'gl-matrix'
import * as Glu from '../../lib/gl-help.js'

const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT
const categoryColors = {
    'Resource': [1, 1, .6],
    'Communications': [1, .8, 1],
    'Navigation': [.8, .8, 1],
    'Scientific': [.8, 1, .8],
    'Debris': [.6, .6, .6],
    'Misc': [1, 1, 1]
}

const setupGl = async (gl, numVertex) => {
    const vertPath = './shaders/satellite-vert.glsl'
    const fragPath = './shaders/satellite-frag.glsl'
    const program = await Glu.loadProgram(gl, vertPath, fragPath)
    Glu.switchShader(gl, program)

    const posBuffer = Glu.initBuffer(gl, new Float32Array(numVertex*3), gl.DYNAMIC_DRAW)
    const colBuffer = Glu.initBuffer(gl, new Float32Array(numVertex*3), gl.STATIC_DRAW)

    const locations = {}
    locations['aPosition'] = Glu.initAttribute(gl, 'aPosition', 3, 3, 0, false, FLOAT_SIZE)
    locations['aColor'] = Glu.initAttribute(gl, 'aColor', 3, 3, 0, false, FLOAT_SIZE)
    locations['uModelMatrix'] = gl.getUniformLocation(gl.program, 'uModelMatrix')
    locations['uViewMatrix'] = gl.getUniformLocation(gl.program, 'uViewMatrix')
    locations['uInvMatrix'] = gl.getUniformLocation(gl.program, 'uInvMatrix')
    locations['uMousePos'] = gl.getUniformLocation(gl.program, 'uMousePos')

    return {
        program: program,
        posBuffer: posBuffer,
        colBuffer: colBuffer,
        locations: locations,
        numVertex: numVertex
    }
}

const updateBuffer = (gl, data, ref) => {
    if (ref?.program) {
        gl.bindBuffer(gl.ARRAY_BUFFER, ref.posBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.length*3), gl.DYNAMIC_DRAW)

        const colors = new Float32Array(data.length*3)
        data.forEach((item, i) => {
            const color = categoryColors[item.category]
            colors.set(color, i*3)
        })
        gl.bindBuffer(gl.ARRAY_BUFFER, ref.colBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

        ref.numVertex = data.length
    }
    return ref
}

const updateProjMatrix = (gl, projMatrix, ref) => {
    if (ref?.program) {
        Glu.switchShader(gl, ref.program)
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
    }
}

const getInvMat = (modelRef, viewRef, projRef) => {
    const mvpMat = mat4.multiply(mat4.create(),
        mat4.multiply(mat4.create(),
            projRef.current,
            viewRef.current
        ),
        modelRef.current
    )
    return mat4.invert(mat4.create(), mvpMat)
}

const updateMousePos = (gl, mouseX, mouseY, modelRef, viewRef, projRef, ref) => {
    if (ref?.program) {
        const { locations, program } = ref
        Glu.switchShader(gl, program)
        gl.uniformMatrix4fv(locations.uInvMatrix, false, getInvMat(modelRef, viewRef, projRef))
        gl.uniform2f(locations.uMousePos, 2*mouseX/innerWidth - 1, -(2*mouseY/innerHeight - 1))
    }
}

const distLinePoint = (line0, line1, point) => {
    const numer = vec3.length(
        vec3.cross(vec3.create(),
            vec3.subtract(vec3.create(), point, line0),
            vec3.subtract(vec3.create(), point, line1)
        )
    )
    const denom = vec3.length(
        vec3.subtract(vec3.create(),
            line0,
            line1
        )
    )
    return numer/denom
}

const filterMouseClick = (mouseX, mouseY, modelRef, viewRef, projRef, posData) => {
    const mouseClipX = 2*mouseX/innerWidth - 1
    const mouseClipY = -(2*mouseY/innerHeight - 1)
    const mouseNear = vec4.fromValues(mouseClipX, mouseClipY, 0, 1)
    const mouseFar = vec4.fromValues(mouseClipX, mouseClipY, 1, 1)
    const invMat = getInvMat(modelRef, viewRef, projRef)
    const unprojNear = vec4.transformMat4(vec4.create(), mouseNear, invMat)
    const unprojFar = vec4.transformMat4(vec4.create(), mouseFar, invMat)
    const lineNear = vec3.scale(vec3.create(), unprojNear, unprojNear[3])
    const lineFar = vec3.scale(vec3.create(), unprojFar, unprojFar[3])
    const lineVec = vec3.subtract(vec3.create(), lineFar, lineNear)
    let minDist = 10000
    let nearest
    for (let i = 0; i < posData.length; i += 3) {
        const point = posData.slice(i*3, (i+1)*3)
        const dist = distLinePoint(lineNear, lineFar, point)
        if (dist < minDist) {
            nearest = i/3
        }
    }
    return nearest
}

const draw = (gl, viewMatrix, modelMatrix, positions, ref) => {
    if (ref?.program) {
        const { program, posBuffer, colBuffer, locations, numVertex } = ref

        Glu.switchShader(gl, program)

        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions)
        gl.vertexAttribPointer(locations.aPosition, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer)
        gl.vertexAttribPointer(locations.aColor, 3, gl.FLOAT, false, 3 * FLOAT_SIZE, 0)

        gl.uniformMatrix4fv(locations.uModelMatrix, false, modelMatrix)
        gl.uniformMatrix4fv(locations.uViewMatrix, false, viewMatrix)
        gl.drawArrays(gl.POINTS, 0, numVertex)
    }
}

export {
    setupGl,
    updateMousePos,
    updateProjMatrix,
    updateBuffer,
    filterMouseClick,
    draw
}
