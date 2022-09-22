import { mat4, vec3 } from 'gl-matrix'

let currXRotation = 0
const mouseRotate = (matrix, deltaX, deltaY, rotateSpeed, rotateBound) => {
    let thisXRotation = -deltaY*rotateSpeed
    if (Math.abs(currXRotation + thisXRotation) > rotateBound) 
        thisXRotation = Math.sign(thisXRotation)*(rotateBound - Math.abs(currXRotation))
    currXRotation += thisXRotation

    const rX = mat4.fromXRotation(mat4.create(), thisXRotation)
    const rZ = mat4.fromZRotation(mat4.create(), deltaX*rotateSpeed)
    return mat4.multiply(
        mat4.create(),
        mat4.multiply(mat4.create(),
            rX,
            matrix
        ),
        rZ
    )
}

const scrollZoom = (matrix, deltaScroll, zoomSpeed, minZoom, maxZoom) => {
    const zoomMag = 1 + deltaScroll*zoomSpeed
    const invMatrix = mat4.invert(mat4.create(), matrix)
    let newPosition = invMatrix.slice(12, 15).map(val => val * zoomMag)
    const newLen = vec3.length(newPosition)
    if (newLen > maxZoom) 
        newPosition = vec3.scale(vec3.create(), newPosition, maxZoom/newLen)
    else if (newLen < minZoom)
        newPosition = vec3.scale(vec3.create(), newPosition, minZoom/newLen)
    return mat4.lookAt(mat4.create(),
        newPosition,
        [0, 0, 0],
        [0, 0, 1]
    )
}

export { 
    mouseRotate,
    scrollZoom
}
