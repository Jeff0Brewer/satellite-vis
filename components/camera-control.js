import TextToggle from '../components/text-toggle.js'
import styles from '../styles/CameraControl.module.css'

const CameraControl = props => {
    const toggleMode = () => {
        if (props.mode === 'INERTIAL')
            props.setMode('FIXED')
        else
            props.setMode('INERTIAL')
    }

    const cancelFollow = () => {
        props.setFollowId('')
    }

    return (
        <section className={props.visible ? styles.control : styles.hidden}>{
            props.followId ?
            <p>{`Viewing #${props.followId}`}</p> : 
            <span>
                <p>View:</p>
                <TextToggle
                    styleName={styles.toggle}
                    selectedStyle={styles.toggleActive}
                    value0={'INERTIAL'}
                    value1={'FIXED'}
                    currValue={props.mode}
                    setValue={props.setMode}
                />
            </span>}
            <span>
                <p>Lighting:</p>
                <TextToggle
                    styleName={styles.toggle}
                    selectedStyle={styles.toggleActive}
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
