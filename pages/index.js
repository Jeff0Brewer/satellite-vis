import React, { useRef, useEffect, useState } from 'react'
import Clock from '../components/clock.js'
import SatVis from '../components/sat-vis.js'
import { tleToKeplerian } from '../lib/tle-kepler.js'
import styles from '../styles/Home.module.css'

const Home = () => {
    const [visData, setVisData] = useState(new Float32Array())
    const [visTime, setVisTime] = useState()

    const getData = () => {
        fetch('/api/tle/1')
            .then(res => res.json())
            .then(data => { 
                let out = []
                data.member.forEach(el => {
                    const k = tleToKeplerian(el.tle[0], el.tle[1])
                    for (const key in k) {
                        if (key !== 'year')
                            out.push(k[key])
                    }
                })
                setVisData(new Float32Array(out))
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <main className={styles.home}>
            <Clock setTime={setVisTime} />
            <SatVis data={visData} time={visTime} />
        </main>
    )
}

export default Home
