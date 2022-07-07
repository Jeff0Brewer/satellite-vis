const degToRad = angle => {
    return angle * Math.PI / 180
}

const motionToAxis = meanMotion => {
    const n = meanMotion * (Math.PI*2 / 86400)
    const mu = 3.986004418 * Math.pow(10, 14)
    return Math.pow(mu/(n*n), 1/3)
}

const tleToKeplerian = (line1, line2) => {
    const meanMotion = parseFloat(line2.substring(52, 63))
    const eccentricity = parseFloat('.' + line2.substring(26, 33))
    const perigree = parseFloat(line2.substring(34, 42))
    const rightAscension = parseFloat(line2.substring(17, 25))
    const inclination = parseFloat(line2.substring(8, 16))
    const meanAnomoly = parseFloat(line2.substring(43, 51))
    const epochYear = parseFloat(line1.substring(18, 20))
    const epochDay = parseFloat(line1.substring(20, 32))

    return {
        axis: motionToAxis(meanMotion),
        eccentricity: eccentricity,
        periapsis: degToRad(perigree),
        lan: degToRad(rightAscension),
        inclination: degToRad(inclination),
        anomoly: degToRad(meanAnomoly),
        year: epochYear,
        day: epochDay
    }
}

export {
    degToRad,
    motionToAxis,
    tleToKeplerian
}
