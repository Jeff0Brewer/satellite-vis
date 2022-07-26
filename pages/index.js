import React, { useRef, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Visualization from '../components/visualization.js'
import ClockUi from '../components/clock.js'
import { sgp4, twoline2satrec } from 'satellite.js'

const Home = () => {
    const [satData, setSatData] = useState(new Float32Array())
    const [startEpoch, setStartEpoch] = useState()
    const [clockSpeed, setClockSpeed] = useState()

    const getData = () => {
        fetch('/api/get-tles')
            .then(res => res.json())
            .then(data => {
                const satrecs = data.map(el => twoline2satrec(el.line1, el.line2))
                let numErr = 0
                satrecs.forEach((satrec, i) => {
                    const { position, velocity } = sgp4(satrec, 10000)
                    if (satrec.error && satrec.error != 6) {
                        console.log(satrec.error)
                        //console.log(satrec)
                        //console.log(data[i])
                    }
                })
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <main className={styles.home}>
            <ClockUi setStartEpoch={setStartEpoch} setClockSpeed={setClockSpeed} />
            <Visualization startEpoch={startEpoch} clockSpeed={clockSpeed} data={satData} />
        </main>
    )
}

export default Home
