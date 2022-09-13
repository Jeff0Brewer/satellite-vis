const newEpoch = date => {
    const epoch = new Float64Array(new SharedArrayBuffer(8))
    epoch[0] = date.getTime()
    return epoch
}

const getEpochDisplay = epoch => {
    const date = new Date(epoch[0])
    return date.toLocaleDateString('en-US', {
        year: '2-digit',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).toLowerCase()
}

export {
    newEpoch,
    getEpochDisplay
}
