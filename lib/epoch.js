const SEC_PER_DAY = 86400
const DAY_PER_YEAR = 365

const epochFromDate = date => {
    const year = Number(String(date.getUTCFullYear()).slice(-2))
    const second = ((((date.getUTCHours() * 60) + date.getUTCMinutes()) * 60) + date.getUTCSeconds()) + date.getUTCMilliseconds()/1000
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0))
    let day = (date - yearStart)/86400000
    day -= day % 1

    return {
        year: year,
        day: day,
        second: second
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

const epochDiff = (a, b) => {
    return Math.abs(((a.year - b.year)*DAY_PER_YEAR + (a.day - b.day))*SEC_PER_DAY + (a.second - b.second))
}

export {
    epochFromDate,
    incrementEpoch,
    epochDiff
}
