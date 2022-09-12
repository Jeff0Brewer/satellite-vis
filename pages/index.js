import { useState, useRef } from 'react'
import { newEpoch } from '../lib/shared-epoch.js'
import Catalog from '../components/catalog.js'
import CameraControl from '../components/camera-control.js'
import Clock from '../components/clock.js'
import Visualization from '../components/visualization.js'
import styles from '../styles/Home.module.css'


const Home = () => {
    const [satData, setSatData] = useState([])
    const [cameraMode, setCameraMode] = useState('INERTIAL')
    const [followId, setFollowId] = useState('')
    const [clockSpeed, setClockSpeed] = useState(0)
    const sharedEpochRef = useRef(newEpoch(new Date()))

    return (
        <main className={styles.home}>
            <section className={styles.interface}>
                <div>
                    <Clock sharedEpoch={sharedEpochRef.current} setSpeed={setClockSpeed} />
                    <CameraControl mode={cameraMode} setMode={setCameraMode} followId={followId} setFollowId={setFollowId} />
                </div>
                <Catalog data={satData} setData={setSatData} followId={followId} setFollowId={setFollowId} />
            </section>
            <Visualization 
                data={satData} 
                epoch={sharedEpochRef.current} 
                clockSpeed={clockSpeed} 
                followId={followId} 
                cameraMode={cameraMode} 
            />
        </main>
    )
}

export default Home
