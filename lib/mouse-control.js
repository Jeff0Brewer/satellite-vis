import { mat4 } from 'gl-matrix'

const mouseRotate = (matrix, deltaX, deltaY, rotateSpeed) => {
    const rX = mat4.fromXRotation(mat4.create(), -deltaY*rotateSpeed)
    const rZ = mat4.fromZRotation(mat4.create(), deltaX*rotateSpeed)
    return mat4.multiply(
        mat4.create(),
        mat4.multiply(mat4.create(), rX, rZ),
        matrix
    )
}

const scrollZoom = (matrix, deltaScroll, zoomSpeed) => {
    const zoomMag = 1 + deltaScroll*zoomSpeed
    return mat4.multiply(
        mat4.create(),
        mat4.fromScaling(mat4.create(), [zoomMag, zoomMag, zoomMag]),
        matrix
    )
}

export { 
    mouseRotate,
    scrollZoom
}
