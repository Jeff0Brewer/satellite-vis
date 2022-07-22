import React, { useRef, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Visualization from '../components/visualization.js'
import ClockUi from '../components/clock.js'

const Home = () => {
    const [satData, setSatData] = useState(new Float32Array())
    const [startEpoch, setStartEpoch] = useState()
    const [clockSpeed, setClockSpeed] = useState()

    const getSatData = () => {
        fetch('/api/get-keplerian')
            .then(res => res.json())
            .then(data => setSatData(data))
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getSatData()
    }, [])

    return (
        <main className={styles.home}>
            <ClockUi setStartEpoch={setStartEpoch} setClockSpeed={setClockSpeed} />
            <Visualization startEpoch={startEpoch} clockSpeed={clockSpeed} data={satData} />
        </main>
    )
}

export default Home
