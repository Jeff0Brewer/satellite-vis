import React, { useRef, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import SatVis from '../components/sat-vis.js'
import ClockUi from '../components/clock.js'
import { getEpoch } from '../lib/epoch.js'

const Home = () => {
    const [satData, setSatData] = useState(new Float32Array())
    const [startEpoch, setStartEpoch] = useState(getEpoch(new Date()))
    const [clockSpeed, setClockSpeed] = useState()

    const getData = () => {
        fetch('/api/get-keplerian')
            .then(res => res.json())
            .then(data => { 
                let out = []
                for(let i = 0; i < data.length; i++) {
                    out.push(...data[i].attribs)
                }
                setSatData(new Float32Array(out))
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <main className={styles.home}>
            <ClockUi setStartEpoch={setStartEpoch} setClockSpeed={setClockSpeed} />
            <SatVis startEpoch={startEpoch} clockSpeed={clockSpeed} data={satData} />
        </main>
    )
}

export default Home
