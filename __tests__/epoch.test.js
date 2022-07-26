import { epochFromDate, epochTleDiff } from '../lib/epoch.js'

const testDate = new Date(Date.UTC(2020, 0, 18, 1, 1, 1, 1))

test('epochFromDate returns object with year, day, second properties', () => {
    const epoch = epochFromDate(new Date())
    expect(epoch).toHaveProperty('year')
    expect(epoch).toHaveProperty('day')
    expect(epoch).toHaveProperty('second')
})

test('epochFromDate returns correct year', () => {
    const epoch = epochFromDate(testDate)
    expect(epoch.year).toBe(20)
})

test('epochFromDate returns correct day', () => {
    const epoch = epochFromDate(testDate)
    expect(epoch.day).toBe(17)
})

test('epochFromDate returns correct second', () => {
    const epoch = epochFromDate(testDate)
    const second = 60 * 60 + 60 + 1 + 1/1000
    expect(epoch.second).toBe(second)
})

test('epochTleDiff returns correct difference', () => {
    const epoch = {
        year: 22,
        day: 5,
        second: 12.890723
    }
    const diff = epochTleDiff(epoch, 22, 5.00014919818)
    expect(diff).toBeCloseTo(0)
})
