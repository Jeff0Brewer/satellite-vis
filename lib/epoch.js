const getEpoch = date => {
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

const S_PER_DAY = 86400
const DAY_PER_YEAR = 365
const incrementEpoch = (epoch, elapsed) => {
    epoch.second += elapsed/1000
    if (epoch.second < S_PER_DAY) 
        return epoch

    epoch.day += Math.floor(epoch.second/S_PER_DAY)
    epoch.second = epoch.second % S_PER_DAY
    if (epoch.day < DAY_PER_YEAR) 
        return epoch

    epoch.year += Math.floor(epoch.day/DAY_PER_YEAR)
    epoch.day = epoch.day % DAY_PER_YEAR
    return epoch
}

export {
    getEpoch,
    incrementEpoch
}
