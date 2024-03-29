import React, { useEffect, useRef } from 'react'
import styles from '../styles/PowRange.module.css'

// range input with exponential value response
const PowRange = props => {
    const inputRef = useRef()

    // convert html input value to exponential value
    const rawToVal = val => {
        return Math.sign(val) * Math.pow(Math.abs(val), props.pow)
    }

    // convert exponential value to html input value
    const valToRaw = val => {
        return Math.sign(val) * Math.pow(Math.abs(val), 1 / props.pow)
    }

    // on load attach event handlers and call callbacks with default value
    useEffect(() => {
        const eventHandlers = {}
        if (props?.onChange) {
            eventHandlers.change = e => props.onChange(rawToVal(e.target.value))
            inputRef.current.addEventListener('change', eventHandlers.change)
            props.onChange(props.defaultValue)
        }
        if (props?.onInput) {
            eventHandlers.input = e => props.onInput(rawToVal(e.target.value))
            inputRef.current.addEventListener('input', eventHandlers.input)
            props.onInput(props.defaultValue)
        }
        return () => {
            for (const [type, handler] of Object.entries(eventHandlers)) {
                inputRef.current.removeEventListener(type, handler)
            }
        }
    }, [])

    return (
        <input ref={inputRef} className={`${styles.pow} ${props?.styleName}`}
            type="range"
            min={valToRaw(props.min)}
            max={valToRaw(props.max)}
            defaultValue={valToRaw(props.defaultValue)}
            step={props.step}
        />
    )
}

export default PowRange
