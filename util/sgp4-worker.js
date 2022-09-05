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
        let currYear = epochYear
        let currDay = epochDay
        let lastT = Date.now()
        const tick = () => {
            const currT = Date.now()
            const elapsed = currT - lastT
            lastT = currT
            if (elapsed > 100) return

            currDay += elapsed*clockSpeed/86400000
            if (currDay > 365) {
                currYear += 1
                currDay = currDay - 365
            }
            if (currDay < 0) {
                currYear -= 1
                currDay = currDay + 365
            }
            sgp4.propagate(memory, currYear, currDay)
        }
        if (intervalId)
            clearInterval(intervalId)
        intervalId = setInterval(tick, 1000/60)
    }
}
