import { useEffect } from 'react'
import styles from '../styles/Catalog.module.css'

const Catalog = props => {
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
    }, [props.data])

    return (
        <section className={styles.catalog}>
            <span className={styles.labels}>
                <div>
                    name
                </div>
                <div>
                    id
                </div>
                <div>
                    type
                </div>
                <div>
                    trail
                </div>
            </span>
        </section>
    )
}

export default Catalog
