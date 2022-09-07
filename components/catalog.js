import { useEffect } from 'react'
import { twoline2satrec } from 'satellite.js'
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

    return (
        <section>
        </section>
    )
}

export default Catalog
