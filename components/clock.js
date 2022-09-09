import { useState, useEffect, useRef } from 'react'
import { getEpochDisplay, setEpochDate } from '../lib/shared-epoch.js'
import { CgUndo } from 'react-icons/cg'
import PowRange from './pow-range.js'
import styles from '../styles/Clock.module.css'

const Clock = props => {
    const [epochText, setEpochText] = useState()
    const [speedText, setSpeedText] = useState()
    const intervalIdRef = useRef()

    const displayEpoch = () => {
        setEpochText(getEpochDisplay(props.sharedEpoch))
    }

    const resetEpoch = () => {
        setEpochDate(props.sharedEpoch, new Date())
        displayEpoch()
    }

    useEffect(() => {
        intervalIdRef.current = setInterval(displayEpoch, 1000)
        return () => clearInterval(intervalIdRef.current)
    }, [])

    return (
        <section className={styles.clock}>
            <span>
                <p className={styles.epochText}>
                    {epochText}
                </p>
                <button className={styles.reset} onClick={resetEpoch}>
                    <CgUndo />
                </button>
            </span>
            <span>
                <p className={styles.speedText}>
                    {speedText + 'x'}
                </p>
                <PowRange
                    styleName={styles.speedInput}
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
