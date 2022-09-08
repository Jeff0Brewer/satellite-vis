import { useState, useRef } from 'react'
import Visualization from '../components/visualization.js'
import Clock from '../components/clock.js'
import Catalog from '../components/catalog.js'
import { newEpoch } from '../lib/shared-epoch.js'
import styles from '../styles/Home.module.css'

const Home = () => {
    const [satData, setSatData] = useState([])
    const [clockSpeed, setClockSpeed] = useState(0)
    const sharedEpochRef = useRef(newEpoch(new Date()))

    return (
        <main className={styles.home}>
            <Clock sharedEpoch={sharedEpochRef.current} setSpeed={setClockSpeed} />
            <Catalog setData={setSatData} />
            <Visualization data={satData} clockSpeed={clockSpeed} epoch={sharedEpochRef.current} />
        </main>
    )
}

export default Home
