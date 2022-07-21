import React, { useRef, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import SatVis from '../components/sat-vis.js'
import ClockUi from '../components/clock.js'

const Home = () => {
    const [satData, setSatData] = useState(new Float32Array())
    const [tleReference, setTleReference] = useState()
    const [startEpoch, setStartEpoch] = useState()
    const [clockSpeed, setClockSpeed] = useState()

    const getSatData = () => {
        fetch('/api/get-keplerian')
            .then(res => res.json())
            .then(data => { 
                let out = []
                data.forEach(el => out.push(...el.attribs))
                setSatData(new Float32Array(out))
            })
            .catch(err => console.log(err))
    }

    const getTleReference = () => {
        fetch('/api/get-tle-ref')
            .then(res => res.json())
            .then(tle => {
                setTleReference(tle)
            })
    }

    useEffect(() => {
        getSatData()
        getTleReference()
    }, [])

    return (
        <main className={styles.home}>
            <ClockUi setStartEpoch={setStartEpoch} setClockSpeed={setClockSpeed} />
            <SatVis startEpoch={startEpoch} clockSpeed={clockSpeed} data={satData} tleReference={tleReference} />
        </main>
    )
}

export default Home
