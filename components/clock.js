import React, { useRef, useEffect } from 'react'

const Clock = props => {
    const frameIdRef = useRef()
    const epochRef = useRef()

    const clockSpeed = 1000
    const tickRate = 1000/60
    const msPerDay = 86400000

    let lastT = 0
    const update = time => {
        const elapsed = time - lastT
        if (elapsed < tickRate) {
            frameIdRef.current = window.requestAnimationFrame(update)
            return
        }
        lastT = time

        epochRef.current += elapsed/msPerDay * clockSpeed
        props.setTime(epochRef.current)

        frameIdRef.current = window.requestAnimationFrame(update)
    }

    useEffect(() => {
        const currT = new Date()
        const startT = new Date(Date.UTC(currT.getFullYear(), 0))
        epochRef.current = (currT - startT)/msPerDay
        props.setTime(epochRef.current)

        frameIdRef.current = window.requestAnimationFrame(update)
        return () => {
            window.cancelAnimationFrame(frameIdRef.current)
        }
    }, [])

    return (
        <></>
    )
}

export default Clock
