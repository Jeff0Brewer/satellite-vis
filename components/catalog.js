import { useState, useEffect } from 'react'
import styles from '../styles/Catalog.module.css'

const Catalog = props => {
    const [currItems, setCurrItems] = useState()
    const [currPage, setCurrPage] = useState(0)
    const ITEM_PER_PAGE = 50


    const getSatRecs = () => {
        fetch('/api/get-tles')
            .then(res => res.json())
            .then(data => {
                props.setData(data)
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getSatRecs()
    }, [])

    useEffect(() => {
        console.log(props.data)
        const items = props.data.slice(currPage*ITEM_PER_PAGE, (currPage+1)*ITEM_PER_PAGE)
        setCurrItems(
            items.map(item => (
                <span className={styles.listItem}>
                    <p>{item.name}</p>
                    <p>{item.satelliteId}</p>
                    <p>{item.category}</p>
                    <input type="checkbox" />
                    <div>
                        <button>O</button>
                    </div>
                </span>
            ))
        )
    }, [props.data])

    return (
        <section className={styles.catalog}>
            <span className={styles.labels}>
                <div>
                    NAME:
                    <input type="text" placeholder="Search" />
                </div>
                <div>
                    ID:
                    <input type="text" placeholder="Search" />
                </div>
                <div>
                    TYPE:
                    {/*dropdown placeholder*/}
                    <input type="text" placeholder="Select" />
                </div>
                <div>
                    TRAIL:
                    <button>X</button>
                </div>
                <div>
                    VIEW:
                    <button>X</button>
                </div>
            </span>
            <section className={styles.list}>
                {currItems}
            </section>
        </section>
    )
}

export default Catalog
