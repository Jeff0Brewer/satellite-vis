import { getSunPosition, getJulianTime, eclipticToEquatorial } from '../lib/sun.js'

test('getJulianTime returns correct julian date', () => {
    const ms = Date.UTC(2022, 7, 6)
    const julianDate = 2459797.5
    expect(getJulianTime(ms / 1000)).toBe(julianDate)
})

test('eclipticToEquatorial converts correctly', () => {
    const lambda = 180.02874231746654
    const n = 8300.57283204468
    const alpha = -3.14113238
    const delta = -0.00019951
    const { lat, lng } = eclipticToEquatorial(lambda, n)
    expect(lng).toBeCloseTo(alpha)
    expect(lat).toBeCloseTo(delta)
})

test('getSunPosition returns correct position at utc noon', () => {
    const ms = Date.UTC(2022, 0, 1, 11)
    const pos = getSunPosition(ms)
    const comp = [28082839.29, -132488860.58, -57431304.90]
    pos.forEach((v, i) => {
        expect(v).toBeCloseTo(comp[i])
    })
})
