import { mat4 } from 'gl-matrix'

const mouseToRotation = (dX, dY) => {
    const rSpeed = .01
    const rX = mat4.fromXRotation(mat4.create(), -dY*rSpeed)
    const rZ = mat4.fromZRotation(mat4.create(), dX*rSpeed)
    return mat4.multiply(mat4.create(), rX, rZ)
}

export { 
    mouseToRotation
}
