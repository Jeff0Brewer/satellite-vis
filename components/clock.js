import React, { useEffect } from 'react'
import { getEpoch } from '../lib/epoch.js'
import styles from '../styles/Clock.module.css'

const ClockUi = props => {
    const defaultSpeed = 1

    useEffect(() => {
        props.setStartEpoch(getEpoch(new Date()))
        props.setClockSpeed(defaultSpeed)
    }, [])

    const speedInputChange = e => {
        const val = parseFloat(e.target.value)
        if (!isNaN(val)) {
            props.setClockSpeed(Math.abs(val))
        }
    }

    return (
        <input className={styles.speed} type='text' defaultValue={defaultSpeed} onChange={speedInputChange} />
    )
}

export default ClockUi
