// normalize vec3
const normalize3 = v => {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    if (length === 0) { return [0, 0, 0] }
    return [v[0] / length, v[1] / length, v[2] / length]
}

// find midpoint between vec3s
const midpoint3 = (a, b) => {
    return [
        (a[0] + b[0]) / 2,
        (a[1] + b[1]) / 2,
        (a[2] + b[2]) / 2
    ]
}

// calculate icosphere with given iterations
const getIcosphere = iterations => {
    // initialize starting icosphere
    const x = (1 + Math.sqrt(5)) / 2
    let vertices = [
        [-1, x, 0], [1, x, 0], [-1, -x, 0],
        [1, -x, 0], [0, -1, x], [0, 1, x],
        [0, -1, -x], [0, 1, -x], [x, 0, -1],
        [x, 0, 1], [-x, 0, -1], [-x, 0, 1]
    ].map(vertex => normalize3(vertex))
    let triangles = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ]

    // each iteration convert each triangle to 4 new and normalize
    for (let iteration = 0; iteration < iterations; iteration++) {
        const nextVertices = []
        const nextTriangles = []
        triangles.forEach(tri => {
            const v0 = vertices[tri[0]]
            const v1 = vertices[tri[1]]
            const v2 = vertices[tri[2]]
            const v3 = normalize3(midpoint3(v0, v1))
            const v4 = normalize3(midpoint3(v1, v2))
            const v5 = normalize3(midpoint3(v2, v0))
            const i = nextVertices.length
            nextVertices.push(v0, v1, v2, v3, v4, v5)
            nextTriangles.push(
                [0 + i, 3 + i, 5 + i],
                [3 + i, 1 + i, 4 + i],
                [4 + i, 2 + i, 5 + i],
                [3 + i, 4 + i, 5 + i]
            )
        })
        vertices = nextVertices
        triangles = nextTriangles
    }
    return {
        vertices,
        triangles
    }
}

export default getIcosphere
export {
    normalize3,
    midpoint3
}
