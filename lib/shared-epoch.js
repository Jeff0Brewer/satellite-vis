const MS_PER_DAY = 86400000
const DAY_PER_YEAR = 365
const YEAR_IND = 0
const DAY_IND = 1

const newEpoch = (date) => {
    const fullYear = date.getUTCFullYear()
    const year = fullYear % 1000
    const day = (date - new Date(Date.UTC(fullYear, 0)))/MS_PER_DAY

    const epoch = new Float64Array(new SharedArrayBuffer(8*2))
    epoch[0] = year
    epoch[1] = day
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

export {
    newEpoch,
    incrementEpoch,
    getEpochYear,
    getEpochDay
}
