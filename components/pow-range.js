import { useEffect, useRef } from 'react'

const PowRange = props => {
    const inputRef = useRef()

    const rawToVal = val => {
        return Math.sign(val) * Math.pow(Math.abs(val), props.pow)
    }

    const valToRaw = val => {
        return Math.sign(val) * Math.pow(Math.abs(val), 1/props.pow)
    }

    useEffect(() => {
        if (props?.onChange) {
            inputRef.current.addEventListener('change',
                e => props.onChange(rawToVal(e.target.value))
            )
            props.onChange(props.defaultValue)
        }
        if (props?.onInput) {
            inputRef.current.addEventListener('input',
                e => props.onInput(rawToVal(e.target.value))
            )
            props.onInput(props.defaultValue)
        }
    }, [])

    return (
        <input ref={inputRef}
            type="range"
            min={valToRaw(props.min)}
            max={valToRaw(props.max)}
            defaultValue={valToRaw(props.defaultValue)}
            step={props.step}
        />
    )
}

export default PowRange
