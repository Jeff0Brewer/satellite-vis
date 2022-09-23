import React, { useState, useEffect, useRef } from 'react'
import { getEpochDisplay } from '../lib/shared-epoch.js'
import { IoMdRefresh } from 'react-icons/io'
import PowRange from './pow-range.js'
import styles from '../styles/Clock.module.css'

// controls for visualization epoch
const Clock = props => {
    const [epochText, setEpochText] = useState()
    const [speedText, setSpeedText] = useState()
    const intervalIdRef = useRef()

    const displayEpoch = () => {
        setEpochText(getEpochDisplay(props.sharedEpoch))
    }

    // set current epoch to current time
    const resetEpoch = () => {
        props.sharedEpoch[0] = new Date().getTime()
        displayEpoch()
    }

    // update epoch text on interval
    useEffect(() => {
        intervalIdRef.current = setInterval(displayEpoch, 1000)
        return () => clearInterval(intervalIdRef.current)
    }, [])

    return (
        <section className={styles.clock}>
            <span className={styles.clockRow}>
                <p className={styles.epochText}>
                    {epochText}
                </p>
                <button className={styles.resetEpoch} onClick={resetEpoch}>
                    <IoMdRefresh />
                </button>
            </span>
            <span className={styles.clockRow}>
                <p className={styles.speedText}>
                    {speedText + 'x'}
                </p>
                <PowRange
                    styleName={styles.speedInput}
                    pow={4}
                    min={-10000}
                    max={10000}
                    step={0.01}
                    defaultValue={75}
                    onChange={value => props.setSpeed(value)}
                    onInput={value => setSpeedText(Math.round(value))}
                />
            </span>
        </section>
    )
}

export default Clock
