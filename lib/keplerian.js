import { vec3 } from 'gl-matrix'

const elementsFromPosVel = (position, velocity) => {
    const { create: vec, fromValues, cross, dot, len: mag, scale, subtract } = vec3
    const { pow, acos, PI: pi } = Math

    const r = fromValues(position.x, position.y, position.z)
    const v = fromValues(velocity.x, velocity.y, velocity.z)

    const mu = 3.986004418 * pow(10, 5)

    const h = cross(vec(), r, v)
    const n = cross(vec(), [0, 0, 1], h)

    const evec = subtract(vec(), 
        scale(vec(), r, pow(mag(v), 2)/mu - 1/mag(r)), 
        scale(vec(), v, dot(r, v)/mu)
    )
    const e = mag(evec)

    const energy = pow(mag(v), 2)/2 - mu/mag(r)
    const a = e < 1 ? -mu/(2*energy) : Infinity

    const i = acos(h[2]/mag(h))

    let lan = acos(n[0]/mag(n))
    if (n[1] < 0)
        lan = 2*pi - lan

    let argp = acos(dot(n, evec)/(mag(n)*e))
    if (e[2] < 0)
        argp = 2*pi - argp

    let nu = acos(dot(evec, r)/(e*mag(r)))
    if (dot(r, v) < 0)
        nu = 2*pi - nu

    return {
        ecc: e,
        axis: a,
        incl: i,
        lan: lan,
        argp: argp,
        anom: nu
    }
}

export default elementsFromPosVel
