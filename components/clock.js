import React, { useState, useRef, useEffect } from 'react'
import styles from '../styles/Clock.module.css'

const MS_PER_DAY = 86400000

const getEpoch = date => {
    const startDate = new Date(Date.UTC(date.getUTCFullYear(), 0))
    return (date - startDate)/MS_PER_DAY
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

            epochRef.current += elapsed/MS_PER_DAY * speed
            props.setEpoch(epochRef.current)

            requestFrame(update)
        }
        requestFrame(update)

        return cancelFrame
    }, [speed])

    const speedInputChange = e => {
        const val = parseFloat(e.target.value)
        if (val) {
            setSpeed(val)
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
