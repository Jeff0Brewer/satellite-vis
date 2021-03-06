const degToRad = angle => {
    return angle * Math.PI / 180
}

const motionToAxis = meanMotion => {
    const n = meanMotion * (Math.PI*2 / 86400)
    const mu = 3.986004418 * Math.pow(10, 14)
    return Math.pow(mu/(n*n), 1/3)
}

const validateTle = (line1, line2) => {
    const valid1 = /^1 .{6} .{8} .{14} .{10} .{8} .{8} . .{5}$/.test(line1)
    const valid2 = /^2 .{5} .{8} .{8} .{7} .{8} .{8} .{17}$/.test(line2)
    return valid1 && valid2
}

const getTlePageCount = () => {
    return fetch('http://tle.ivanstanojevic.me/api/tle/?page-size=100&page=1')
        .then(res => res.json())
        .then(res => { 
            const lastUrl = res.view.last
            const pageNumber = lastUrl.substring(lastUrl.lastIndexOf('=') + 1)
            return parseInt(pageNumber)
        })
        .catch(err => console.log(err))
}

const tleToKeplerian = (name, line1, line2) => {
    const meanMotion = parseFloat(line2.substring(52, 63))
    const eccentricity = parseFloat('.' + line2.substring(26, 33))
    const perigree = parseFloat(line2.substring(34, 42))
    const rightAscension = parseFloat(line2.substring(17, 25))
    const inclination = parseFloat(line2.substring(8, 16))
    const meanAnomaly = parseFloat(line2.substring(43, 51))

    const epochYear = parseFloat(line1.substring(18, 20))
    let epochDay = parseFloat(line1.substring(20, 32))
    let epochSecond = (epochDay % 1)*86400
    epochDay -= epochDay % 1

    return {
        name: name,
        axis: motionToAxis(meanMotion),
        eccentricity: eccentricity,
        periapsis: degToRad(perigree),
        lngAcendingNode: degToRad(rightAscension),
        inclination: degToRad(inclination),
        anomaly: degToRad(meanAnomaly),
        year: epochYear,
        day: epochDay,
        second: epochSecond
    }
}

export {
    degToRad,
    motionToAxis,
    validateTle,
    getTlePageCount,
    tleToKeplerian
}
