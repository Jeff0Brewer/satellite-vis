import { useState, useEffect } from 'react'
import { GiOrbit } from 'react-icons/gi'
import { FaRegEye, FaBan } from 'react-icons/fa'
import { satCategories } from '../util/celes-groups.js'
import MultiSelect from './multi-select.js'
import styles from '../styles/Catalog.module.css'

const Catalog = props => {
    const [dataset, setDataset] = useState([])
    const [currPage, setCurrPage] = useState(0)
    const ITEM_PER_PAGE = 20

    const [nameSearch, setNameSearch] = useState('')
    const [idSearch, setIdSearch] = useState('')
    const [selectedCategories, setSelectedCategories] = useState(new Set(satCategories))

    const toggleCategory = category => {
        const selected = new Set(selectedCategories)
        if (selected.has(category))
            selected.delete(category)
        else
            selected.add(category)
        setSelectedCategories(selected)
    }

    useEffect(() => {
        fetch('/api/get-tles')
            .then(res => res.json())
            .then(data => {
                setDataset(data)
                props.setData(data)
            })
            .catch(err => console.log(err))
    }, [])

    useEffect(() => {
        props.setData(dataset.filter(item => {
            return selectedCategories.has(item.category) &&
                item.name.toLowerCase().includes(nameSearch) &&
                item.satelliteId.toString().includes(idSearch)
        }))
    }, [nameSearch, idSearch, selectedCategories])

    return (
        <section className={styles.catalog}>
            <span className={styles.labels}>
                <div className={styles.labelLarge}>
                    NAME:
                    <input 
                        type="text" 
                        placeholder="Search" 
                        onChange={e => 
                            setNameSearch(e.target.value.toLowerCase())
                        } 
                    />
                </div>
                <div className={styles.labelLarge}>
                    ID:
                    <input 
                        type="text" 
                        placeholder="Search" 
                        onChange={e => 
                            setIdSearch(e.target.value)
                        } 
                    />
                </div>
                <div className={styles.labelLarge}>
                    TYPE:
                    <MultiSelect 
                        items={satCategories} 
                        itemState={selectedCategories} 
                        toggleItem={toggleCategory} 
                        styleName={styles.select} 
                        placeholder="Select"
                    />
                </div>
                <button className={`${styles.labelSmall} ${styles.inactive}`}>
                    <FaBan />
                </button>
                <button className={`${styles.labelSmall} ${styles.inactive}`}>
                    <FaBan />
                </button>
            </span>
            <section className={styles.list}>{
                props.data.slice(currPage*ITEM_PER_PAGE, (currPage+1)*ITEM_PER_PAGE)
                    .map((item, i) => (
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
            }</section>
        </section>
    )
}

export default Catalog
