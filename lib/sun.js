import { geodeticToEcf } from 'satellite.js'

const degSin = deg => Math.sin(deg * Math.PI/180)
const degCos = deg => Math.cos(deg * Math.PI/180)

const getJulianTime = t => {
    return t / 86400 + 2440587.5
}

const eclipticToEquatorial = (lambda, R, n) => {
    const epsilon = 23.439 - 0.0000004 * n
    const alpha = Math.atan2(degCos(epsilon) * degSin(lambda), degCos(lambda))
    const delta = Math.asin(degSin(epsilon) * degSin(lambda))
    return {
        lng: alpha,
        lat: delta
    }
}

const getSunPosition = ms => {
    const jd = getJulianTime(ms/1000)
    const n = jd - 2451545
    const L = (280.460 + 0.9856474 * n) % 360
    const g = (357.528 + 0.9856003 * n) % 360
    const lambda = (L + 1.915 * degSin(g) + 0.020 * degSin(2 * g)) % 360
    const R = 1.00014 - 0.01671 * degCos(g) - 0.00014 * degCos(2 * g)

    const { lat, lng } = eclipticToEquatorial(lambda, R, n)
    const alt = R * 149597870.7
    const { x, y, z } = geodeticToEcf({
        longitude: lng,
        latitude: lat,
        height: alt
    })

    return [x, y, z]
}

const getSunNormal = ms => {
    const { x, y, z } = getSunPosition(ms)
    const invLen = 1/Math.sqrt(x*x + y*y + z*z)
    return [
        x*invLen,
        y*invLen,
        z*invLen
    ]
}

export {
    getSunPosition,
    getSunNormal
}
