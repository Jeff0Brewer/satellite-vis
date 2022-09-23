import React, { useRef, useEffect } from 'react'
import { IoClose } from 'react-icons/io5'
import styles from '../styles/Catalog.module.css'

// text input with button to clear current value
const SearchInput = props => {
    const inputRef = useRef()

    // update input value on external state change
    useEffect(() => {
        if (inputRef.current.value !== props.value) {
            inputRef.current.value = props.value
        }
    }, [props.value])

    return (
        <span className={props.styleName}>
            {props.label}
            <div className={styles.inputWrap}>
                <input
                    className={styles.filterInput}
                    ref={inputRef}
                    type="text"
                    placeholder="Search"
                    onChange={e => props.setValue(e.target.value)}
                />
                <button
                    className={`${styles.clearSearch} ${props.value ? '' : styles.clearSearchHidden}`}
                    onClick={() => {
                        props.setValue('')
                        inputRef.current.value = ''
                    }}
                >
                    <IoClose />
                </button>
            </div>
        </span>
    )
}

export default SearchInput
