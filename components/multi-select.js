import { useState } from 'react'
import styles from '../styles/MultiSelect.module.css'

const MultiSelect = props => {
    const [listOpen, setListOpen] = useState(false)

    const toggleOpen = () => {
        setListOpen(!listOpen)
    }

    return (
        <div className={props.styleName}>
            <a className={styles.toggle} onClick={toggleOpen}>
                {props.placeholder}
            </a>
            <section className={styles.list}>{ 
                listOpen ? 
                props.items.map((item, i) => 
                    <a key={i}>{item}</a>
                ) :
                <></>
            }</section>
        </div>
    )
}

export default MultiSelect
