import tleToKeplerian, { degToRad, motionToAxis } from '../lib/tle-kepler.js'

const line1 = "1 25544U 98067A   22187.91168981  .00005281  00000+0  10097-3 0  9998"
const line2 = "2 25544  51.6429 238.9000 0004438 341.2767   1.5583 15.49849532348232"

test('degToRad correct for angle of 0', () => {
    expect(degToRad(0)).toBe(0)
})

test('degToRad correct for angle of 360', () => {
    expect(degToRad(360)).toBe(Math.PI*2)
})

test('motionToAxis calculates correct semimajor axis for ISS', () => {
    const ISSmeanMotion = 15.4984953
    const ISSmajorAxis = 6795302.856642774

    expect(motionToAxis(ISSmeanMotion)).toBe(ISSmajorAxis)
})

test('tleToKeplerian returns complete keplerian element set', () => {
    const k = tleToKeplerian('name', line1, line2)

    expect(k).toHaveProperty('name')
    expect(k).toHaveProperty('epochYear')
    expect(k?.attribs.length).toBe(7)
})
