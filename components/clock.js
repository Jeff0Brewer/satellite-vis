import React, { useState, useRef, useEffect } from 'react'
import styles from '../styles/Clock.module.css'

const MS_PER_DAY = 86400000

const getEpoch = date => {
    const year = Number(String(date.getUTCFullYear()).slice(-2))
    const second = ((((date.getUTCHours() * 60) + date.getUTCMinutes()) * 60) + date.getUTCSeconds()) + date.getUTCMilliseconds()/1000
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0))
    let day = (date - yearStart)/86400000
    day -= day % 1

    return {
        year: year,
        day: day,
        second: second
    }
}

const incrementEpoch = (epoch, elapsed) => {
    epoch.second += elapsed
    if (epoch.second < 86400) 
        return epoch

    epoch.second = epoch.second % 86400
    epoch.day += 1
    if (epoch.day < 365) 
        return epoch

    epoch.day = epoch.day % 365
    epoch.year += 1
    return epoch
}

const Clock = props => {
    const [speed, setSpeed] = useState(30)
    const epochRef = useRef()

    const frameIdRef = useRef()
    const requestFrame = func => frameIdRef.current = window.requestAnimationFrame(func)
    const cancelFrame = () => window.cancelAnimationFrame(frameIdRef.current)

    useEffect(() => {
        epochRef.current = getEpoch(new Date())
        props.setEpoch(epochRef.current)
    }, [])

    useEffect(() => {
        let lastT = 0
        const update = time => {
            const elapsed = time - lastT
            lastT = time

            epochRef.current = incrementEpoch(epochRef.current, elapsed*speed)
            props.setEpoch(epochRef.current)

            requestFrame(update)
        }
        requestFrame(update)

        return cancelFrame
    }, [speed])

    const speedInputChange = e => {
        const val = parseFloat(e.target.value)
        if (!isNaN(val)) {
            setSpeed(Math.abs(val))
        }
    }

    return (
        <input className={styles.speed} type='text' defaultValue={speed} onChange={speedInputChange} />
    )
}

export default Clock
export {
    getEpoch
}
