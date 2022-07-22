import { epochFromDate, incrementEpoch } from '../lib/epoch.js'

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

test('incrementEpoch correctly increments seconds', () => {
    let epoch = epochFromDate(testDate)
    const startSecond = epoch.second
    epoch = incrementEpoch(epoch, 1000)
    expect(epoch.second).toBe(startSecond + 1)
})

test('incrementEpoch correctly increments days', () => {
    let epoch = epochFromDate(testDate)
    const startDay = epoch.day
    epoch = incrementEpoch(epoch, 86400*1000)
    expect(epoch.day).toBe(startDay + 1)
})

test('incrementEpoch correctly increments years', () => {
    let epoch = epochFromDate(testDate)
    const startYear = epoch.year
    epoch = incrementEpoch(epoch, 365*86400*1000)
    expect(epoch.year).toBe(startYear + 1)
})

