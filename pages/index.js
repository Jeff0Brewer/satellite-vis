import React, { useState } from 'react'
import styles from '../styles/Home.module.css'
import Visualization from '../components/visualization.js'
import Catalog from '../components/catalog.js'

const Home = () => {
    const [satData, setSatData] = useState(new Float32Array())

    return (
        <main className={styles.home}>
            <Visualization data={satData} />
            <Catalog setData={setSatData} />
        </main>
    )
}

export default Home
