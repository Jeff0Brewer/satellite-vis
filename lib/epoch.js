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

const incrementEpoch = (epoch, elapsed) => {
    epoch.second += elapsed/1000
    if (epoch.second < 86400) 
        return epoch

    epoch.second = epoch.second % 86400
    epoch.day += 1
    if (epoch.day < 365) 
        return epoch

    epoch.day = epoch.day % 365
    epoch.year += 1
    return epoch
}

export {
    getEpoch,
    incrementEpoch
}
