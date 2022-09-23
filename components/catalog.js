import React, { useState, useEffect } from 'react'
import { FaBan, FaCaretLeft, FaCaretRight } from 'react-icons/fa'
import { twoline2satrec } from 'satellite.js'
import { satCategories } from '../util/celes-groups.js'
import SearchInput from './search-input.js'
import MultiSelect from './multi-select.js'
import CatalogItem from './catalog-item.js'
import styles from '../styles/Catalog.module.css'

// component for catalog of visualized satellites, provides data to visualization
const Catalog = props => {
    // reference to full dataset
    const [dataset, setDataset] = useState([])

    const [currPage, setCurrPage] = useState(0)
    const [maxPage, setMaxPage] = useState(0)
    const ITEM_PER_PAGE = 20

    // parameters for filtering dataset
    const [nameSearch, setNameSearch] = useState('')
    const [idSearch, setIdSearch] = useState('')
    const [selectedCategories, setSelectedCategories] = useState(new Set(satCategories))

    const setVisData = data => {
        props.setData(data)
        setMaxPage(Math.floor(data.length / ITEM_PER_PAGE))
        setCurrPage(0)
    }

    // fetch data from endpoint on load, store reference and pass full dataset to visualization
    useEffect(() => {
        fetch('/api/get-tles')
            .then(res => res.json())
            .then(data => {
                const satrecs = data.map(item => {
                    return {
                        name: item.name,
                        satelliteId: item.satelliteId,
                        category: item.category,
                        satrec: twoline2satrec(item.line1, item.line2)
                    }
                })
                setDataset(satrecs)
                setVisData(satrecs)
                props.setLoaded(true)
            })
            .catch(err => console.log(err))
    }, [])

    // filter dataset by parameter, pass to visualization
    useEffect(() => {
        setVisData(dataset.filter(item => {
            return selectedCategories.has(item.category) &&
                item.name.toLowerCase().includes(nameSearch) &&
                item.satelliteId.includes(idSearch)
        }))
    }, [nameSearch, idSearch, selectedCategories])

    // filter to one satellite when clicked in visualization
    useEffect(() => {
        if (props.selectId) {
            setIdSearch(props.selectId)
            props.setSelectId('')
        }
    }, [props.selectId])

    return (
        <section className={props.visible ? styles.catalog : styles.hidden}>
            <span className={styles.catalogLabels}>
                <SearchInput
                    styleName={styles.labelLarge}
                    label="Name:"
                    value={nameSearch}
                    setValue={val => setNameSearch(val.toLowerCase())}
                />
                <SearchInput
                    styleName={styles.labelLarge}
                    label="Id:"
                    value={idSearch}
                    setValue={val => setIdSearch(val)}
                />
                <MultiSelect
                    styleName={styles.labelLarge}
                    label="Type:"
                    items={satCategories}
                    itemState={selectedCategories}
                    setState={setSelectedCategories}
                />
                <button
                    className={`${styles.labelSmall} ${props.followId ? styles.clearActive : styles.clearInactive}`}
                    onClick={() => props.setFollowId('')}
                >
                    <FaBan />
                </button>
            </span>
            <section className={styles.catalogList}>{
                props.data
                    .slice(currPage * ITEM_PER_PAGE, (currPage + 1) * ITEM_PER_PAGE)
                    .map((item, i) =>
                        <CatalogItem item={item} followId={props.followId} setFollowId={props.setFollowId} key={i} />)
            }{
                maxPage > 0
                    ? <span className={styles.pageControls}>
                        <button
                            className={styles.pageArrow}
                            onClick={() => setCurrPage(Math.max(currPage - 1, 0))}
                        >
                            <FaCaretLeft />
                        </button>
                        <p>{`${currPage + 1} / ${maxPage + 1}`}</p>
                        <button
                            className={styles.pageArrow}
                            onClick={() => setCurrPage(Math.min(currPage + 1, maxPage))}
                        >
                            <FaCaretRight />
                        </button>
                    </span>
                    : <></>
            }
            </section>
        </section>
    )
}

export default Catalog
