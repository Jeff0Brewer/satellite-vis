import { Sgp4Calc } from '../wasm/sgp/pkg/sgp.js'
import { getEpochYear, getEpochDay } from '../lib/shared-epoch.js'

const sgp4 = new Sgp4Calc()
let intervalId

onmessage = e => {
    if (e.data?.data) {
        sgp4.set_data(e.data.data)
    }
    if (e.data?.memory && e.data?.epoch) {
        const { memory, epoch } = e.data
        const tick = () => {
            sgp4.propagate(memory, getEpochYear(epoch), getEpochDay(epoch))
        }
        if (intervalId)
            clearInterval(intervalId)
        intervalId = setInterval(tick, 1000/60)
    }
}
