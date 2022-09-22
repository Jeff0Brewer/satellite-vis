import React from 'react'
import TextToggle from '../components/text-toggle.js'
import styles from '../styles/CameraControl.module.css'

const CameraControl = props => {
    return (
        <section className={props.visible ? styles.camControl : styles.hidden}>{
            props.followId
                ? <p className={styles.row} >{`Following #${props.followId}`}</p>
                : <span className={styles.row}>
                    <p>Reference:</p>
                    <TextToggle
                        styleName={styles.toggle}
                        value0={'INERTIAL'}
                        value1={'FIXED'}
                        currValue={props.mode}
                        setValue={props.setMode}
                    />
                </span>}
        <span className={styles.row}>
            <p>Lighting:</p>
            <TextToggle
                styleName={styles.toggle}
                value0={'OFF'}
                value1={'ON'}
                currValue={props.lighting}
                setValue={props.setLighting}
            />
        </span>
        </section>
    )
}

export default CameraControl
