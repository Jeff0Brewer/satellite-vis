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
        <section className={styles.control}>{
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
            </span>
        }</section>
    )
}

export default CameraControl
