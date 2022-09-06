const MS_PER_DAY = 86400000
const DAY_PER_YEAR = 365
const YEAR_IND = 0
const DAY_IND = 1
const YEAR_OFFSET = 2000

const setEpochDate = (epoch, date) => {
    const fullYear = date.getUTCFullYear()
    const year = fullYear - YEAR_OFFSET 
    const day = (date - new Date(Date.UTC(fullYear, 0)))/MS_PER_DAY
    epoch[0] = year
    epoch[1] = day
}

const newEpoch = date => {
    const epoch = new Float64Array(new SharedArrayBuffer(8*2))
    setEpochDate(epoch, date)
    return epoch
}

const incrementEpoch = (epoch, ms) => {
    let year = epoch[YEAR_IND]
    let day = epoch[DAY_IND]
    day += ms/MS_PER_DAY
    if (day > DAY_PER_YEAR) {
        const yearInc = Math.floor(day/DAY_PER_YEAR)
        day = day - yearInc*DAY_PER_YEAR
        year += yearInc
    }
    else if (day < 0) {
        const yearDec = Math.floor(Math.abs(day)/DAY_PER_YEAR) + 1
        day = day + yearDec*DAY_PER_YEAR
        year -= yearDec
    }
    epoch[YEAR_IND] = year
    epoch[DAY_IND] = day
}

const getEpochYear = epoch => {
    return epoch[YEAR_IND]
}

const getEpochDay = epoch => {
    return epoch[DAY_IND]
}

const getEpochDisplay = epoch => {
    const yearMs = new Date(Date.UTC(epoch[YEAR_IND] + YEAR_OFFSET)).getTime()
    const dayMs = epoch[DAY_IND]*MS_PER_DAY
    const date = new Date(yearMs + dayMs)
    let hour = date.getHours()
    let minute = date.getMinutes()
    let amPm = 'am'
    if (hour > 12) {
        hour -= 12
        amPm = 'pm'
    }
    if (minute < 10) {
        minute = '0' + minute
    }

    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${hour}:${minute}${amPm}`
}

export {
    newEpoch,
    incrementEpoch,
    getEpochYear,
    getEpochDay,
    getEpochDisplay,
    setEpochDate
}
