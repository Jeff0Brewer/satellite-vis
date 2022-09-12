import { propagate } from 'satellite.js'

const MS_PER_DAY = 86400000
let intervalId

onmessage = e => {
    const { data, memory, epoch } = e.data
    const tick = () => {
        const date = new Date(epoch[0])
        data.forEach((satrec, i) => {
            const { position } = propagate(satrec, date)
            if (satrec.error === 0) {
                memory[i*3] = position.x
                memory[i*3+1] = position.y
                memory[i*3+2] = position.z
            }
            else {
                memory[i*3] = 0
                memory[i*3+1] = 0
                memory[i*3+2] = 0
            }
        })
    }
    if (intervalId)
        clearInterval(intervalId)
    intervalId = setInterval(tick, 1000/60)
}
