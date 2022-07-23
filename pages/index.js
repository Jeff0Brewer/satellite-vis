import React, { useRef, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Visualization from '../components/visualization.js'
import ClockUi from '../components/clock.js'
import { twoline2satrec } from 'satellite.js'

const Home = () => {
    const [satData, setSatData] = useState(new Float32Array())
    const [startEpoch, setStartEpoch] = useState()
    const [clockSpeed, setClockSpeed] = useState()

    const getSatData = () => {
        fetch('/api/get-tles')
            .then(res => res.json())
            .then(data => { 
                let satRecs = []
                data.forEach(tle => {
                    const satRec = twoline2satrec(tle.line1, tle.line2)
                    satRecs.push(satRec)
                })
                setSatData(satRecs)
            })
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
