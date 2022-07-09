import { getEpoch } from '../components/clock.js'

test('getEpoch returns 0 for start of year', () => {
    const epoch = getEpoch(new Date(Date.UTC(2020, 0)))
    expect(epoch).toBe(0)
})

test('getEpoch returns 365 for end of year', () => {
    const epoch = getEpoch(new Date(Date.UTC(2020, 11, 31)))
    expect(epoch).toBe(365)
})

test('getEpoch returns fractional portion of day', () => {
    const epoch = getEpoch(new Date(Date.UTC(2020, 0, 0, 12)))
    expect(epoch % 1).toBe(.5)
})
