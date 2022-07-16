import { getEpoch, incrementEpoch } from '../lib/epoch.js'

const testDate = new Date(Date.UTC(2020, 0, 18, 1, 1, 1, 1))

test('getEpoch returns object with year, day, second properties', () => {
    const epoch = getEpoch(new Date())
    expect(epoch).toHaveProperty('year')
    expect(epoch).toHaveProperty('day')
    expect(epoch).toHaveProperty('second')
})

test('getEpoch returns correct year', () => {
    const epoch = getEpoch(testDate)
    expect(epoch.year).toBe(20)
})

test('getEpoch returns correct day', () => {
    const epoch = getEpoch(testDate)
    expect(epoch.day).toBe(17)
})

test('getEpoch returns correct second', () => {
    const epoch = getEpoch(testDate)
    const second = 60 * 60 + 60 + 1 + 1/1000
    expect(epoch.second).toBe(second)
})

test('incrementEpoch correctly increments seconds', () => {
    let epoch = getEpoch(testDate)
    const startSecond = epoch.second
    epoch = incrementEpoch(epoch, 1000)
    expect(epoch.second).toBe(startSecond + 1)
})

test('incrementEpoch correctly increments days', () => {
    let epoch = getEpoch(testDate)
    const startDay = epoch.day
    epoch = incrementEpoch(epoch, 86400*1000)
    expect(epoch.day).toBe(startDay + 1)
})

test('incrementEpoch correctly increments years', () => {
    let epoch = getEpoch(testDate)
    const startYear = epoch.year
    epoch = incrementEpoch(epoch, 365*86400*1000)
    expect(epoch.year).toBe(startYear + 1)
})

