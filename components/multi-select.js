import React, { useState } from 'react'
import { BiCheck } from 'react-icons/bi'
import styles from '../styles/Catalog.module.css'

const MultiSelect = props => {
    const [listOpen, setListOpen] = useState(false)

    const toggleItem = item => {
        const selected = new Set(props.itemState)
        if (selected.has(item)) { selected.delete(item) } else { selected.add(item) }
        props.setState(selected)
    }

    return (
        <div className={props.styleName}>
            {props.label}
            <div className={styles.inputWrap}>
                <div
                    className={`${styles.multiSelect} ${styles.filterInput}`}
                    tabIndex='0'
                    onBlur={() => setListOpen(false)}
                >
                    <a className={styles.multiSelectToggle} onClick={() => setListOpen(!listOpen)}>
                        <p className={styles.multiSelectPlaceholder}>
                            Select
                        </p>
                    </a>
                    <section className={styles.selectList}>{
                        listOpen
                            ? props.items.map((item, i) =>
                                <a
                                    className={styles.selectItem}
                                    key={i}
                                    onClick={() => toggleItem(item)}
                                >
                                    <div className={styles.selectMark}>{
                                        props.itemState.has(item)
                                            ? <BiCheck />
                                            : <></>
                                    }</div>
                                    <p>{item}</p>
                                </a>
                            )
                            : <></>
                    }</section>
                </div>
            </div>
        </div>
    )
}

export default MultiSelect
