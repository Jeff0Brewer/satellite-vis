import { useState, useEffect } from 'react'
import { GiOrbit } from 'react-icons/gi'
import { FaRegEye, FaBan, FaCaretLeft, FaCaretRight } from 'react-icons/fa'
import { twoline2satrec } from 'satellite.js'
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
        props.setFollowId('')
        setMaxPage(Math.floor(data.length/ITEM_PER_PAGE))
        setCurrPage(0)
    }

    useEffect(() => {
        //fetch('/api/get-tles')
        fetch('./tles.json') // for offline dev
            .then(res => res.json())
            .then(data => {
                const satrecs = data.map(item => {
                    return {
                        name: item.name,
                        satelliteId: item.satelliteId,
                        category: item.category,
                        satrec: twoline2satrec(item.line1, item.line2),
                    }
                })
                setDataset(satrecs)
                setVisData(satrecs)
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
        <section className={props.visible ? styles.catalog : styles.hidden}>
            <span className={styles.labels}>
                <div className={styles.labelLarge}>
                    Name:
                    <input 
                        className={styles.filterInput}
                        type="text" 
                        placeholder="Search" 
                        onChange={e => 
                            setNameSearch(e.target.value.toLowerCase())
                        } 
                    />
                </div>
                <div className={styles.labelLarge}>
                    Id:
                    <input 
                        className={styles.filterInput}
                        type="text" 
                        placeholder="Search" 
                        onChange={e => 
                            setIdSearch(e.target.value)
                        } 
                    />
                </div>
                <div className={styles.labelLarge}>
                    Type:
                    <MultiSelect 
                        styleName={styles.filterInput} 
                        items={satCategories} 
                        itemState={selectedCategories} 
                        toggleItem={toggleCategory} 
                        placeholder="Select"
                    />
                </div>
                <button 
                    className={`${styles.labelSmall} ${props.followId ? '' : styles.inactive}`}
                    onClick={() => props.setFollowId('')}
                >
                    <FaBan />
                </button>
            </span>
            <section className={styles.list}>{
                props.data.slice(currPage*ITEM_PER_PAGE, (currPage+1)*ITEM_PER_PAGE)
                    .map((item, i) => <CatalogItem item={item} followId={props.followId} setFollowId={props.setFollowId} key={i} />) }{
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
    const followItem = () => {
        props.setFollowId(props.item.satelliteId)
    }

    return (
        <span className={styles.listItem}>
            <p className={styles.labelLarge}>{props.item.name}</p>
            <p className={styles.labelLarge}>{props.item.satelliteId}</p>
            <p className={styles.labelLarge}>{props.item.category}</p>
            <button 
                className={`${styles.labelSmall} ${props.followId === props.item.satelliteId ? '' : styles.unselected}`}
                onClick={() => props.setFollowId(props.item.satelliteId)}
            >
                <FaRegEye />
            </button>
        </span>
    )
}

export default Catalog
