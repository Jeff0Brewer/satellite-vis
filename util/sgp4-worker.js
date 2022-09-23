import { propagate } from 'satellite.js'

let intervalId

const loopCalc = (data, memory, epoch, tickrate) => {
    const tick = () => {
        const date = new Date(epoch[0])
        data.forEach((satrec, i) => {
            const { position } = propagate(satrec, date)
            if (satrec.error === 0) {
                memory[i * 3] = position.x
                memory[i * 3 + 1] = position.y
                memory[i * 3 + 2] = position.z
            } else {
                memory[i * 3] = 0
                memory[i * 3 + 1] = 0
                memory[i * 3 + 2] = 0
            }
        })
    }
    if (intervalId) { clearInterval(intervalId) }
    intervalId = setInterval(tick, tickrate)
}

onmessage = e => {
    const { task } = e.data
    if (task === 'start') {
        loopCalc(e.data.data, e.data.memory, e.data.epoch, e.data.tickrate)
    } else if (intervalId) {
        clearInterval(intervalId)
    }
}
