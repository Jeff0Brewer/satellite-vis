const MS_PER_DAY = 86400000
const SEC_PER_DAY = 86400
const DAY_PER_YEAR = 365

const epochFromDate = date => {
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0))
    const dayFrac = (date - yearStart)/MS_PER_DAY
    return {
        year: date.getUTCFullYear() % 100,
        day: dayFrac - (dayFrac % 1),
        second: (dayFrac % 1) * SEC_PER_DAY
    }
}

const incrementEpoch = (epoch, elapsed) => {
    epoch.second += elapsed/1000
    if (epoch.second < SEC_PER_DAY) 
        return epoch

    epoch.day += Math.floor(epoch.second/SEC_PER_DAY)
    epoch.second = epoch.second % SEC_PER_DAY
    if (epoch.day < DAY_PER_YEAR) 
        return epoch

    epoch.year += Math.floor(epoch.day/DAY_PER_YEAR)
    epoch.day = epoch.day % DAY_PER_YEAR
    return epoch
}

const epochTleDiff = (epoch, tleYears, tleDays) => {
}

const epochDiff = (a, b) => {
    return Math.abs(((a.year - b.year)*DAY_PER_YEAR + (a.day - b.day))*SEC_PER_DAY + (a.second - b.second))
}

export {
    epochFromDate,
    incrementEpoch,
    epochDiff
}
