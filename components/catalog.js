import { useState, useEffect } from 'react'
import { GiOrbit } from 'react-icons/gi'
import { FaRegEye, FaBan, FaCaretLeft, FaCaretRight } from 'react-icons/fa'
import { satCategories } from '../util/celes-groups.js'
import MultiSelect from './multi-select.js'
import styles from '../styles/Catalog.module.css'

const Catalog = props => {
    const [dataset, setDataset] = useState([])
    const [currPage, setCurrPage] = useState(0)
    const [maxPage, setMaxPage] = useState(0)
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

    const setVisData = data => {
        props.setData(data)
        setMaxPage(Math.floor(data.length/ITEM_PER_PAGE))
        setCurrPage(0)
    }

    useEffect(() => {
        fetch('/api/get-tles')
            .then(res => res.json())
            .then(data => {
                setDataset(data)
                setVisData(data)
            })
            .catch(err => console.log(err))
    }, [])

    useEffect(() => {
        setVisData(dataset.filter(item => {
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
                    .map((item, i) => <CatalogItem item={item} key={i} />) }{
                maxPage > 0 ?
                <span>
                    <div>
                        <button onClick={() => setCurrPage(Math.max(currPage - 1, 0))}>
                            <FaCaretLeft />
                        </button>
                        <p>{`${currPage + 1}/${maxPage + 1}`}</p>
                        <button onClick={() => setCurrPage(Math.min(currPage + 1, maxPage))}>
                            <FaCaretRight />
                        </button>
                    </div>
                </span> :
                <></>
            }</section>
        </section>
    )
}

const CatalogItem = props => {
    return (
        <span className={styles.listItem}>
            <p className={styles.labelLarge}>{props.item.name}</p>
            <p className={styles.labelLarge}>{props.item.satelliteId}</p>
            <p className={styles.labelLarge}>{props.item.category}</p>
            <button className={`${styles.labelSmall} ${styles.unselected}`}>
                <GiOrbit />
            </button>
            <button className={`${styles.labelSmall} ${styles.unselected}`}>
                <FaRegEye />
            </button>
        </span>
    )
}

export default Catalog
