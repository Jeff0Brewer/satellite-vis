import React, { useEffect } from 'react'
import { getLatLngObj } from 'tle.js'
import styles from '../styles/Home.module.css'

const Home = () => {
    const getData = () => {
        fetch('/api/tle/2')
            .then(res => res.json())
            .then(data => {
                console.log(data)
                const example = data[Object.keys(data)[0]]
                console.log(getLatLngObj(example.tle, example.timestamp))
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <main className={styles.home}>
        </main>
    )
}

export default Home
