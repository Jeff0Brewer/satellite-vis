import React, { useRef, useEffect } from 'react'

const MS_PER_DAY = 86400000

const getEpoch = date => {
    const startDate = new Date(Date.UTC(date.getUTCFullYear(), 0))
    return (date - startDate)/MS_PER_DAY
}

const Clock = props => {
    const epochRef = useRef()
    const frameIdRef = useRef()
    const clockSpeed = 1000

    let lastT = 0
    const update = time => {
        const elapsed = time - lastT
        lastT = time

        epochRef.current += elapsed/MS_PER_DAY * clockSpeed
        props.setEpoch(epochRef.current)

        frameIdRef.current = window.requestAnimationFrame(update)
    }

    useEffect(() => {
        epochRef.current = getEpoch(new Date())
        props.setEpoch(epochRef.current)

        frameIdRef.current = window.requestAnimationFrame(update)
        return () => window.cancelAnimationFrame(frameIdRef.current)
    }, [])

    return (
        <></>
    )
}

export default Clock
export {
    getEpoch
}
