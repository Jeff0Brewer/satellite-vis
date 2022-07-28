import React, { useState } from 'react'
import styles from '../styles/Home.module.css'
import Visualization from '../components/visualization.js'
import DataProvider from '../components/data-provider.js'

const Home = () => {
    const [satData, setSatData] = useState(new Float32Array())

    return (
        <main className={styles.home}>
            <DataProvider setData={setSatData} />
            <Visualization data={satData} />
        </main>
    )
}

export default Home
