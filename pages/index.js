import React, { useRef, useEffect, useState } from 'react'
import { getLatLngObj } from 'tle.js'

import SatVis from '../components/sat-vis.js'
import styles from '../styles/Home.module.css'

const Home = () => {
    const getData = () => {
        fetch('/api/tle/120')
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getData()
    }, [])
    
    const testData = (new Float32Array(1000*3)).map(e => 2*Math.random() - 1)

    return (
        <main className={styles.home}>
            <SatVis data={testData}/>
        </main>
    )
}

export default Home
