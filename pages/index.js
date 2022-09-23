import React, { useState, useRef, useEffect } from 'react'
import { getBrowserName } from '../util/get-browser.js'
import { newEpoch } from '../lib/shared-epoch.js'
import { FaCaretUp, FaCaretDown } from 'react-icons/fa'
import { IoEarthSharp } from 'react-icons/io5'
import Catalog from '../components/catalog.js'
import CameraControl from '../components/camera-control.js'
import Clock from '../components/clock.js'
import Visualization from '../components/visualization.js'
import styles from '../styles/Home.module.css'

const Home = () => {
    const [loaded, setLoaded] = useState(false)
    const [uiVisible, setUiVisible] = useState(false)
    const [satData, setSatData] = useState([])
    const [lighting, setLighting] = useState('OFF')
    const [cameraMode, setCameraMode] = useState('INERTIAL')
    const [followId, setFollowId] = useState('')
    const [selectId, setSelectId] = useState('')
    const [clockSpeed, setClockSpeed] = useState(0)
    const sharedEpochRef = useRef(newEpoch(new Date()))

    useEffect(() => {
        if (getBrowserName(window) === 'Safari') {
            window.alert(
                'Safari runs this application much slower than other browsers. ' +
                'For best performance use Chrome, Firefox, Edge, Opera, or other alternatives.'
            )
        }
    }, [])

    return (
        <div>
            <main className={loaded ? styles.home : styles.hidden}>
                <section className={styles.interface}>
                    <div className={styles.collapseWrap}>
                        <button
                            className={styles.collapseButton}
                            onClick={() => setUiVisible(!uiVisible)}
                        >{
                                uiVisible
                                    ? <FaCaretDown />
                                    : <FaCaretUp />
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
                            lighting={lighting}
                            setLighting={setLighting}
                        />
                    </div>
                    <Catalog
                        visible={uiVisible}
                        data={satData}
                        setData={setSatData}
                        followId={followId}
                        setFollowId={setFollowId}
                        selectId={selectId}
                        setSelectId={setSelectId}
                        setLoaded={setLoaded}
                    />
                </section>
                <Visualization
                    data={satData}
                    epoch={sharedEpochRef.current}
                    clockSpeed={clockSpeed}
                    followId={followId}
                    cameraMode={cameraMode}
                    lighting={lighting}
                    setSelectId={setSelectId}
                />
            </main> {
            loaded
                ? <></>
                : <p className={styles.loading}>
                    <IoEarthSharp />
                </p>
            }
        </div> 
    )
}

export default Home
