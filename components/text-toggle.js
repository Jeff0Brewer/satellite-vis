import styles from '../styles/CameraControl.module.css'

const TextToggle = props => {
    return (
        <span className={props.styleName}>
            <a 
                className={`${styles.toggleItem} ${
                    props.currValue === props.value0 ? 
                    styles.toggleActive :
                    ''
                }`}
                onClick={() => props.setValue(props.value0)}
            >{
                props.value0
            }</a>
            <a 
                className={`${styles.toggleItem} ${
                    props.currValue === props.value1 ? 
                    styles.toggleActive :
                    ''
                }`}
                onClick={() => props.setValue(props.value1)}
            >{
                props.value1
            }</a>
        </span>
    )
}

export default TextToggle
