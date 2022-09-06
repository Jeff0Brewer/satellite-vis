import { useState, useEffect, useRef } from 'react'
import { getEpochDisplay, setEpochDate } from '../lib/shared-epoch.js'
import PowRange from './pow-range.js'
import styles from '../styles/Clock.module.css'

const Clock = props => {
    const [epochText, setEpochText] = useState()
    const [speedText, setSpeedText] = useState()
    const intervalIdRef = useRef()

    const dipslayEpoch = () => {
        setEpochText(getEpochDisplay(props.sharedEpoch))
    }

    const resetEpoch = () => {
        setEpochDate(props.sharedEpoch, new Date())
    }

    useEffect(() => {
        intervalIdRef.current = setInterval(dipslayEpoch, 300)
        return () => clearInterval(intervalIdRef.current)
    }, [])

    return (
        <section className={styles.clock}>
            <span>
                {epochText}
                <button className={styles.reset} onClick={resetEpoch}></button>
            </span>
            <span>
                {speedText + 'x'}
                <PowRange 
                    pow={4}
                    min={-10000}
                    max={10000}
                    step={0.01}
                    defaultValue={100}
                    onChange={value => props.setSpeed(value)}
                    onInput={value => setSpeedText(Math.round(value))}
                />
            </span>
        </section>
    )
}

export default Clock
