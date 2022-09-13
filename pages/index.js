import { useState, useRef } from 'react'
import { newEpoch } from '../lib/shared-epoch.js'
import { FaCaretUp, FaCaretDown } from 'react-icons/fa'
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
    const [uiVisible, setUiVisible] = useState(false)
    const sharedEpochRef = useRef(newEpoch(new Date()))

    const toggleUi = () => {
        setUiVisible(!uiVisible)
    }

    return (
        <main className={styles.home}>
            <section className={styles.interface}>
                <div className={styles.collapseWrap}>
                    <button className={styles.collapse} onClick={toggleUi}>{
                        uiVisible ?
                        <FaCaretDown /> :
                        <FaCaretUp />
                    }</button>
                </div>
                <div>
                    <Clock 
                        sharedEpoch={sharedEpochRef.current} 
                        setSpeed={setClockSpeed} 
                    />
                    <CameraControl 
                        visible={uiVisible}
                        mode={cameraMode} 
                        setMode={setCameraMode} 
                        followId={followId} 
                        setFollowId={setFollowId} 
                    />
                </div>
                <Catalog 
                    visible={uiVisible}
                    data={satData} 
                    setData={setSatData} 
                    followId={followId} 
                    setFollowId={setFollowId} 
                />
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
