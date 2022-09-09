import { useState } from 'react'
import { BiCheck } from 'react-icons/bi'
import styles from '../styles/MultiSelect.module.css'

const MultiSelect = props => {
    const [listOpen, setListOpen] = useState(false)

    const toggleOpen = () => {
        setListOpen(!listOpen)
    }

    return (
        <div tabindex='0' onBlur={() => setListOpen(false)} className={`${styles.select} ${props.styleName}`}>
            <a className={styles.toggle} onClick={toggleOpen}>
                <p>{props.placeholder}</p>
            </a>
            <section className={styles.list}>{ 
                listOpen ? 
                props.items.map((item, i) => 
                    <a key={i} onClick={() => props.toggleItem(item)}>
                        <div className={styles.check}>{
                            props.itemState.has(item) ? 
                            <BiCheck /> :
                            <></>
                        }</div>
                        <p>{item}</p>
                    </a>
                ) :
                <></>
            }</section>
        </div>
    )
}

export default MultiSelect
