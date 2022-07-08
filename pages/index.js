import React, { useRef, useEffect, useState } from 'react'
import SatVis from '../components/sat-vis.js'
import { tleToKeplerian } from '../lib/tle-kepler.js'
import styles from '../styles/Home.module.css'

const Home = () => {
    const getData = () => {
        fetch('/api/tle/1')
            .then(res => res.json())
            .then(data => { 
                console.log(data)
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getData()
    }, [])
    
    const testData = new Float32Array([
        6795285.461957194, 
        0.00045,
        6.050752829374493,
        4.061911749483411,
        0.9013368949489277,
        1.9406595205605268,
        189.15741203
    ])

    return (
        <main className={styles.home}>
            <SatVis data={testData}/>
        </main>
    )
}

export default Home
