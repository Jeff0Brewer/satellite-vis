const newEpoch = date => {
    const epoch = new Float64Array(new SharedArrayBuffer(8))
    epoch[0] = date.getTime()
    return epoch
}

const getEpochDisplay = epoch => {
    const date = new Date(epoch[0])
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
    getEpochDisplay
}
