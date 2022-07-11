import React, { useRef, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import SatVis from '../components/sat-vis.js'
import Clock from '../components/clock.js'

const Home = () => {
    const [visData, setVisData] = useState(new Float32Array())
    const [visEpoch, setVisEpoch] = useState()

    const getData = () => {
        fetch('/api/get-keplerian')
            .then(res => res.json())
            .then(data => { 
                let out = []
                for(let i = 0; i < data.length; i++) {
                    out.push(...data[i].attribs)
                }
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
