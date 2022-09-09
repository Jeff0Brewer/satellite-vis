import { useState } from 'react'
import { BiCheck } from 'react-icons/bi'
import styles from '../styles/MultiSelect.module.css'

const MultiSelect = props => {
    const [listOpen, setListOpen] = useState(false)
    const [selected, setSelected] = useState(
        props.items.reduce((acc, item) => {
            acc[item] = true
            return acc
        }, {})
    )

    const toggleOpen = () => {
        setListOpen(!listOpen)
    }

    const toggleSelect = item => {
        const newSelected = {...selected}
        newSelected[item] = !newSelected[item]
        setSelected(newSelected)
        props.onChange(newSelected)
    }

    return (
        <div className={`${styles.select} ${props.styleName}`}>
            <a className={styles.toggle} onClick={toggleOpen}>
                <p>{props.placeholder}</p>
            </a>
            <section className={styles.list}>{ 
                listOpen ? 
                props.items.map((item, i) => 
                    <a key={i} onClick={() => toggleSelect(item)}>
                        <div className={styles.check}>{
                            selected[item] ? 
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
