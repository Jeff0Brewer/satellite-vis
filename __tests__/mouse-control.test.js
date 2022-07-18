import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import { mat4 } from 'gl-matrix'

test('mouseRotate returns same matrix on 360 rotation', () => {
    const startMatrix = mat4.create()
    const endMatrix = mouseRotate(startMatrix, Math.PI*2, Math.PI*2, 1)
    endMatrix.forEach((n, i) => {
        expect(startMatrix[i]).toBeCloseTo(n)
    })
})

test('mouseRotate rotates about Z on X movement', () => {
    const mat = mouseRotate(mat4.create(), Math.PI/2, 0, 1)
    const comp = mat4.fromYRotation(mat4.create(), Math.PI/2)
    comp.forEach((n, i) => {
        expect(mat[i]).toBeCloseTo(n)
    })
})

test('mouseRotate rotates about X on Y movement', () => {
    const mat = mouseRotate(mat4.create(), 0, Math.PI/2, 1)
    const comp = mat4.fromXRotation(mat4.create(), Math.PI/2)
    comp.forEach((n, i) => {
        expect(mat[i]).toBeCloseTo(n)
    })
})

test('mouseRotate magnitude impacted by speed parameter', () => {
    const startMatrix = mat4.create()
    const endMatrix = mouseRotate(startMatrix, Math.PI*4, Math.PI*4, 0.5)
    endMatrix.forEach((n, i) => {
        expect(startMatrix[i]).toBeCloseTo(n)
    })
})

test('scrollZoom returns same matrix on 0 scroll', () => {
    const startMatrix = mat4.create()
    const endMatrix = scrollZoom(startMatrix, 0, 1)
    endMatrix.forEach((n, i) => {
        expect(startMatrix[i]).toBeCloseTo(n)
    })
})

test('scrollZoom scales on nonzero scroll', () => {
    const scroll = 5
    const mat = scrollZoom(mat4.create(), scroll, 1)
    expect(mat[0]).toBe(scroll + 1)
})

test('scrollZoom magnitude impacted by speed parameter', () => {
    const speed = 2
    const scroll = 5
    const mat = scrollZoom(mat4.create(), scroll, speed)
    expect(mat[0]).toBe(scroll*speed + 1)
})
