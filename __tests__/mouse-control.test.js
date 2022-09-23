import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import { mat4 } from 'gl-matrix'

test('mouseRotate locks X rotation at bound parameter', () => {
    const mat = mouseRotate(mat4.create(), 0, Math.PI, 1, Math.PI / 2)
    const comp = mat4.fromXRotation(mat4.create(), -Math.PI / 2)
    comp.forEach((n, i) => {
        expect(mat[i]).toBeCloseTo(n)
    })
})

test('mouseRotate returns same matrix on 360 rotation', () => {
    const startMatrix = mat4.create()
    const endMatrix = mouseRotate(startMatrix, Math.PI * 2, Math.PI * 2, 1)
    endMatrix.forEach((n, i) => {
        expect(startMatrix[i]).toBeCloseTo(n)
    })
})

test('mouseRotate rotates about Z on X movement', () => {
    const mat = mouseRotate(mat4.create(), Math.PI / 2, 0, 1)
    const comp = mat4.fromZRotation(mat4.create(), Math.PI / 2)
    comp.forEach((n, i) => {
        expect(mat[i]).toBeCloseTo(n)
    })
})

test('mouseRotate rotates about X on Y movement', () => {
    const mat = mouseRotate(mat4.create(), 0, Math.PI / 2, 1)
    const comp = mat4.fromXRotation(mat4.create(), -Math.PI / 2)
    comp.forEach((n, i) => {
        expect(mat[i]).toBeCloseTo(n)
    })
})

test('mouseRotate magnitude impacted by speed parameter', () => {
    const startMatrix = mat4.create()
    const endMatrix = mouseRotate(startMatrix, Math.PI * 4, Math.PI * 4, 0.5)
    endMatrix.forEach((n, i) => {
        expect(startMatrix[i]).toBeCloseTo(n)
    })
})

test('scrollZoom returns same matrix on 0 scroll', () => {
    const startMatrix = mat4.lookAt(mat4.create(),
        [5, 2, 1],
        [0, 0, 0],
        [0, 0, 1]
    )
    const endMatrix = scrollZoom(startMatrix, 0, 1)
    endMatrix.forEach((n, i) => {
        expect(startMatrix[i]).toBeCloseTo(n)
    })
})

test('scrollZoom scales camera position on nonzero scroll', () => {
    const startMatrix = mat4.lookAt(mat4.create(),
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 1]
    )
    const scroll = 1
    const endMatrix = scrollZoom(startMatrix, scroll, 1)
    const cameraPosition = mat4.invert(mat4.create(), endMatrix).slice(12, 15)
    expect(cameraPosition[0]).toBe(scroll + 1)
})

test('scrollZoom magnitude impacted by speed parameter', () => {
    const startMatrix = mat4.lookAt(mat4.create(),
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 1]
    )
    const scroll = 10
    const speed = 0.5
    const endMatrix = scrollZoom(startMatrix, scroll, speed)
    const cameraPosition = mat4.invert(mat4.create(), endMatrix).slice(12, 15)
    expect(cameraPosition[0]).toBe(scroll * speed + 1)
})
