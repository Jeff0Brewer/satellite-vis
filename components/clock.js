import { useState, useEffect, useRef } from 'react'
import { getEpochDisplay, setEpochDate } from '../lib/shared-epoch.js'
import styles from '../styles/Clock.module.css'

const Clock = props => {
    const [epochText, setEpochText] = useState()
    const [speedText, setSpeedText] = useState()
    const intervalIdRef = useRef()
    const defaultSpeed = 100
    const sliderPow = 4
    const sliderMax = Math.pow(10000, 1/sliderPow)

    const dipslayEpoch = () => {
        setEpochText(getEpochDisplay(props.sharedEpoch))
    }

    const resetEpoch = () => {
        setEpochDate(props.sharedEpoch, new Date())
    }

    const speedFromInput = value => {
        const sign = Math.sign(value)
        const val = Math.pow(Math.abs(value), sliderPow)
        return Math.round(sign*val)
    }

    useEffect(() => {
        intervalIdRef.current = setInterval(dipslayEpoch, 300)
        props.setSpeed(defaultSpeed)
        setSpeedText(defaultSpeed)
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
                <input 
                    type="range" 
                    min={-sliderMax}
                    max={sliderMax}
                    step="0.01"
                    defaultValue={Math.pow(defaultSpeed, 1/sliderPow)} 
                    onChange={e => props.setSpeed(speedFromInput(e.target.value))}
                    onInput={e => setSpeedText(speedFromInput(e.target.value))}
                />
            </span>
        </section>
    )
}

export default Clock
