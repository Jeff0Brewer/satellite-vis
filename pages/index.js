import React, { useRef, useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import SatVis from '../components/sat-vis.js'
import Clock from '../components/clock.js'

const Home = () => {
    const [satData, setSatData] = useState(new Float32Array())
    const [epoch, setEpoch] = useState()

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

    useEffect(() => {
        console.log(epoch)
    }, [epoch])

    const setEpochWrap = val => {
        setEpoch(val)
    }

    return (
        <main className={styles.home}>
            <Clock setEpoch={setEpochWrap} />
            <SatVis data={satData} epoch={epoch} />
        </main>
    )
}

export default Home
