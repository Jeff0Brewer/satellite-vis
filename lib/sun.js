// adapted from: https://astronomy.stackexchange.com/questions/20560/how-to-calculate-the-position-of-the-sun-in-long-lat

import { geodeticToEcf } from 'satellite.js'

const degSin = deg => Math.sin(deg * Math.PI / 180)
const degCos = deg => Math.cos(deg * Math.PI / 180)

// convert timestamp in seconds to julian date
const getJulianTime = t => {
    return t / 86400 + 2440587.5
}

// convert coordinate systems
const eclipticToEquatorial = (lambda, n) => {
    const epsilon = 23.439 - 0.0000004 * n
    const alpha = Math.atan2(degCos(epsilon) * degSin(lambda), degCos(lambda))
    const delta = Math.asin(degSin(epsilon) * degSin(lambda))
    return {
        lng: alpha,
        lat: delta
    }
}

// get current sun position in cartesian coords from millisecond timestamp
const getSunPosition = ms => {
    const jd = getJulianTime(ms / 1000)
    const n = jd - 2451545
    const L = (280.460 + 0.9856474 * n) % 360
    const g = (357.528 + 0.9856003 * n) % 360
    const lambda = (L + 1.915 * degSin(g) + 0.020 * degSin(2 * g)) % 360
    const R = 1.00014 - 0.01671 * degCos(g) - 0.00014 * degCos(2 * g)

    const { lat, lng } = eclipticToEquatorial(lambda, n)
    const alt = R * 149597870.7
    const { x, y, z } = geodeticToEcf({
        longitude: lng,
        latitude: lat,
        height: alt
    })

    return [x, y, z]
}

export {
    getSunPosition,
    getJulianTime,
    eclipticToEquatorial
}
