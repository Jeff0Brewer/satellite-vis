import React, { useRef, useEffect } from 'react'

const Clock = props => {
    const epochRef = useRef()
    const clockSpeed = 1000
    const tickRate = 1000/60
    const msPerDay = 86400000

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

        epochRef.current += elapsed/msPerDay * clockSpeed
        props.setEpoch(epochRef.current)

        requestFrame(update)
    }

    useEffect(() => {
        const currT = new Date()
        const startT = new Date(Date.UTC(currT.getFullYear(), 0))
        epochRef.current = (currT - startT)/msPerDay
        props.setEpoch(epochRef.current)

        requestFrame(update)
        return cancelFrame
    }, [])

    return (
        <></>
    )
}

export default Clock
