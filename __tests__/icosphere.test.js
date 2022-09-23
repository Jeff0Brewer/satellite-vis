import getIcosphere, { normalize3, midpoint3 } from '../lib/icosphere.js'

test('getIcosphere returns vertex and triangle arrays', () => {
    const ico = getIcosphere(0)
    expect(ico).toHaveProperty('vertices')
    expect(ico).toHaveProperty('triangles')
})

test('0 iteration getIcosphere returns 20 sides', () => {
    const { triangles } = getIcosphere(0)
    expect(triangles.length).toBe(20)
})

test('1 iteration getIcosphere returns 80 sides', () => {
    const { triangles } = getIcosphere(1)
    expect(triangles.length).toBe(80)
})

test('2 iteration getIcosphere returns 320 sides', () => {
    const { triangles } = getIcosphere(2)
    expect(triangles.length).toBe(320)
})

test('getIcosphere returns normalized vertices', () => {
    const getLength = v => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    const { vertices } = getIcosphere(1)
    vertices.forEach(vertex => {
        expect(getLength(vertex)).toBeCloseTo(1)
    })
})

test('geticosphere returns edges of similar length', () => {
    const getDistance = (a, b) => Math.sqrt(
        Math.pow(a[0] - b[0], 2) +
        Math.pow(a[1] - b[1], 2) +
        Math.pow(a[2] - b[2], 2)
    )
    const { triangles: t, vertices: v } = getIcosphere(2)
    const distCheck = getDistance(v[t[0][0]], v[t[0][1]])
    t.forEach(tri => {
        [
            getDistance(v[tri[0]], v[tri[1]]),
            getDistance(v[tri[1]], v[tri[2]]),
            getDistance(v[tri[2]], v[tri[0]])
        ].forEach(d => expect(Math.abs(d - distCheck)).toBeLessThan(0.1))
    })
})

test('normalize3 returns vector of length 1', () => {
    const v = [12, -1, -90]
    const n = normalize3(v)
    const length = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2])
    expect(length).toBeCloseTo(1, 2)
})

test('normalize3 returns vector of length 1', () => {
    const v = [-0.02, -0.1, 0.0001]
    const n = normalize3(v)
    const length = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2])
    expect(length).toBeCloseTo(1, 2)
})

test('normalize3 returns vector in same direction', () => {
    const v = [-1, 1, -10]
    const n = normalize3(v)
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    v.forEach((val, i) => expect(val).toBeCloseTo(n[i] * length, 2))
})

test('normalize3 returns zero vector for input of length 0', () => {
    const v = [0, 0, 0]
    const n = normalize3(v)
    n.forEach(val => expect(val).toBe(0))
})

test('normalize3 does not mutate inputs', () => {
    const v = [1, 2, 3]
    const vCopy = v.slice()
    normalize3(v)
    v.forEach((val, i) => expect(val).toBe(vCopy[i]))
})

test('midpoint3 returns correct point', () => {
    const a = [1, 5, -10]
    const b = [3, -1, 10]
    const mid = midpoint3(a, b)
    mid.forEach((val, i) => expect(val).toBe((a[i] + b[i]) / 2))
})

test('midpoint3 does not mutate inputs', () => {
    const a = [0, 1, 2]
    const aCopy = a.slice()
    const b = [-10, -5, 100]
    const bCopy = b.slice()
    midpoint3(a, b)
    a.forEach((val, i) => expect(val).toBe(aCopy[i]))
    b.forEach((val, i) => expect(val).toBe(bCopy[i]))
})
