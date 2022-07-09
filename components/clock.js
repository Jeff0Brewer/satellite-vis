import React, { useRef, useEffect } from 'react'

const MS_PER_DAY = 86400000

const getEpoch = date => {
    const startDate = new Date(Date.UTC(date.getUTCFullYear(), 0))
    return (date - startDate)/MS_PER_DAY
}

const Clock = props => {
    const epochRef = useRef()
    const clockSpeed = 1000
    const tickRate = 1000/60

    const frameIdRef = useRef()
    const requestFrame = func => { frameIdRef.current = window.requestAnimationFrame(func) }
    const cancelFrame = () => { window.cancelAnimationFrame(frameIdRef.current) }

    let lastT = 0
    const update = time => {
        const elapsed = time - lastT
        if (elapsed < tickRate) {
            requestFrame(update)
            return
        }
        lastT = time

        epochRef.current += elapsed/MS_PER_DAY * clockSpeed
        props.setEpoch(epochRef.current)

        requestFrame(update)
    }

    useEffect(() => {
        epochRef.current = getEpoch(new Date())
        props.setEpoch(epochRef.current)

        requestFrame(update)
        return cancelFrame
    }, [])

    return (
        <></>
    )
}

export {
    Clock,
    getEpoch
}
