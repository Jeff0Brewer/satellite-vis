import React, { useRef, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import SatVis from '../components/sat-vis.js'
import { Clock } from '../components/clock.js'
import tleToKeplerian from '../lib/tle-kepler.js'

const Home = () => {
    const [visData, setVisData] = useState(new Float32Array())
    const [visEpoch, setVisEpoch] = useState()

    const getData = () => {
        fetch('/api/tle/1')
            .then(res => res.json())
            .then(data => { 
                let out = []
                data.member.forEach(el => {
                    const k = tleToKeplerian(el.name, el.tle[0], el.tle[1])
                    out = [...out, ...k.attribs]
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
            <Clock setEpoch={setVisEpoch} />
            <SatVis data={visData} epoch={visEpoch} />
        </main>
    )
}

export default Home
