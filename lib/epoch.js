const MS_PER_DAY = 86400000
const SEC_PER_DAY = 86400
const DAY_PER_YEAR = 365

const epochFromDate = date => {
    return {
        year: date.getUTCFullYear() % 100,
        day: Math.floor((date - new Date(Date.UTC(date.getUTCFullYear(), 0)))/MS_PER_DAY),
        second: (date.getUTCHours()*60 + date.getUTCMinutes())*60 + date.getUTCSeconds() + date.getUTCMilliseconds()/1000
    }
}

const epochTleDiff = (epoch, tleYears, tleDays) => {
    const epochDays = epoch.day + epoch.second/SEC_PER_DAY
    return (epoch.year - tleYears)*DAY_PER_YEAR*MS_PER_DAY + (epochDays - tleDays)*MS_PER_DAY
}

export {
    epochFromDate,
    epochTleDiff
}
