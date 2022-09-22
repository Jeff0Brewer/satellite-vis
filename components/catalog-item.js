import React from 'react'
import { FaRegEye } from 'react-icons/fa'
import styles from '../styles/Catalog.module.css'

const CatalogItem = props => {
    return (
        <span className={styles.catalogItem}>
            <p className={styles.labelLarge}>{props.item.name}</p>
            <p className={styles.labelLarge}>{props.item.satelliteId}</p>
            <p className={styles.labelLarge}>{props.item.category}</p>
            <button
                className={`${styles.labelSmall} ${props.followId === props.item.satelliteId ? styles.followSelected : styles.followUnselected}`}
                onClick={() => props.setFollowId(props.item.satelliteId)}
            >
                <FaRegEye />
            </button>
        </span>
    )
}

export default CatalogItem
