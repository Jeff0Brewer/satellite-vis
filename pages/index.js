import React, { useState } from 'react'
import styles from '../styles/Home.module.css'
import Visualization from '../components/visualization.js'
import ClockUi from '../components/clock.js'
import DataProvider from '../components/data-provider.js'

const Home = () => {
    const [satData, setSatData] = useState(new Float32Array())
    const [startEpoch, setStartEpoch] = useState()
    const [clockSpeed, setClockSpeed] = useState()

    return (
        <main className={styles.home}>
            <DataProvider setData={setSatData} />
            <ClockUi setStartEpoch={setStartEpoch} setClockSpeed={setClockSpeed} />
            <Visualization startEpoch={startEpoch} clockSpeed={clockSpeed} data={satData} />
        </main>
    )
}

export default Home
