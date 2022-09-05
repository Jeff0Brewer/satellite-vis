import { Sgp4Calc } from '../wasm/sgp/pkg/sgp.js'

const sgp4 = new Sgp4Calc()
let clockSpeed
let intervalId

onmessage = e => {
    if (e.data?.data) {
        sgp4.set_data(e.data.data)
    }
    if (e.data?.clockSpeed) {
        clockSpeed = e.data.clockSpeed
    }
    const loopArgsPresent = e.data?.memory && e.data?.epochYear && e.data?.epochDay
    if (loopArgsPresent) {
        const { memory, epochYear, epochDay } = e.data
        let curr_year = epochYear
        let curr_day = epochDay
        let lastT = Date.now()
        let buffer = new Float32Array(memory)
        const tick = () => {
            const currT = Date.now()
            const elapsed = currT - lastT
            lastT = currT
            if (elapsed > 100) return

            curr_day += elapsed*clockSpeed/86400000
            if (curr_day > 365) {
                curr_year += 1
                curr_day = curr_day - 365
            }
            if (curr_day < 0) {
                curr_year -= 1
                curr_day = curr_day + 365
            }
            sgp4.propagate(buffer, curr_year, curr_day)
        }
        if (intervalId)
            clearInterval(intervalId)
        intervalId = setInterval(tick, 1000/60)
    }
}
