const getKeplerianStartPos = (axis, eccen, periapsis, inclination, lAN, anomaly) => {
    const { sin, cos, atan2, sqrt } = Math
    const a = axis
    const e = eccen
    const w = periapsis
    const i = inclination
    const o = lAN
    const M = anomaly
    const E = anomaly

    for (let i = 0; i < 10; i++)
        E = E - (E - e*sin(E) - M)/(1.0 - e*cos(E))
    const v = 2.0*atan2(sqrt(1.0 + e)*sin(E/2.0), sqrt(1.0 - e)*cos(E/2.0))
    const r = a*(1.0 - e*cos(E))
    const Ox = r * cos(v)
    const Oy = r * sin(v)
    return {
        x: Ox*(cos(w)*cos(o) - sin(w)*cos(i)*sin(o)) - Oy*(sin(w)*cos(o) + cos(w)*cos(i)*sin(o)),
        y: Ox*(cos(w)*sin(o) + sin(w)*cos(i)*cos(o)) + Oy*(cos(w)*cos(i)*cos(o) - sin(w)*sin(o)),
        z: Ox*(sin(w)*sin(i)) + Oy*(cos(w)*sin(i))
    }
}

export {
    getKeplerianStartPos
}
