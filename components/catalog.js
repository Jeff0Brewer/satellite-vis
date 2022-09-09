import { useState, useEffect } from 'react'
import { GiOrbit } from 'react-icons/gi'
import { FaRegEye, FaBan } from 'react-icons/fa'
import { satCategories } from '../util/celes-groups.js'
import MultiSelect from './multi-select.js'
import styles from '../styles/Catalog.module.css'

const Catalog = props => {
    const [currItems, setCurrItems] = useState()
    const [currPage, setCurrPage] = useState(0)
    const ITEM_PER_PAGE = 25


    const getSatRecs = () => {
        fetch('/api/get-tles')
            .then(res => res.json())
            .then(data => {
                props.setData(data)
            })
            .catch(err => console.log(err))
    }

    const categoryFilter = val => {
        console.log(val)
    }

    useEffect(() => {
        getSatRecs()
    }, [])

    useEffect(() => {
        const items = props.data.slice(currPage*ITEM_PER_PAGE, (currPage+1)*ITEM_PER_PAGE)
        setCurrItems(
            items.map((item, i) => (
                <span key={i} className={styles.listItem}>
                    <p className={styles.labelLarge}>{item.name}</p>
                    <p className={styles.labelLarge}>{item.satelliteId}</p>
                    <p className={styles.labelLarge}>{item.category}</p>
                    <button className={`${styles.labelSmall} ${styles.unselected}`}>
                        <GiOrbit />
                    </button>
                    <button className={`${styles.labelSmall} ${styles.unselected}`}>
                        <FaRegEye />
                    </button>
                </span>
            ))
        )
    }, [props.data])

    return (
        <section className={styles.catalog}>
            <span className={styles.labels}>
                <div className={styles.labelLarge}>
                    NAME:
                    <input type="text" placeholder="Search" />
                </div>
                <div className={styles.labelLarge}>
                    ID:
                    <input type="text" placeholder="Search" />
                </div>
                <div className={styles.labelLarge}>
                    TYPE:
                    <MultiSelect onChange={categoryFilter} styleName={styles.select} placeholder="Select" items={satCategories} />
                </div>
                <button className={`${styles.labelSmall} ${styles.inactive}`}>
                    <FaBan />
                </button>
                <button className={`${styles.labelSmall} ${styles.inactive}`}>
                    <FaBan />
                </button>
            </span>
            <section className={styles.list}>
                {currItems}
            </section>
        </section>
    )
}

export default Catalog
