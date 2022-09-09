import styles from '../styles/TextToggle.module.css'

const TextToggle = props => {
    return (
        <span className={`${styles.toggle} ${props.styleName}`}>
            <a 
                className={
                    props.currValue === props.value0 ? 
                    props.selectedStyle :
                    ''
                }
                onClick={() => props.setValue(props.value0)}
            >{
                props.value0
            }</a>
            <a 
                className={
                    props.currValue === props.value1 ? 
                    props.selectedStyle :
                    ''
                }
                onClick={() => props.setValue(props.value1)}
            >{
                props.value1
            }</a>
        </span>
    )
}

export default TextToggle
