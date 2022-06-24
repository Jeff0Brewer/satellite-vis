import React, { useEffect } from 'react'
import { getLatLngObj } from 'tle.js'
import styles from '../styles/Home.module.css'

const Home = () => {
    const getData = async () => {
        const res = await fetch('/api/tle/2')
        const data = await res.json()
        console.log(data)
        const example = data[Object.keys(data)[0]]
        console.log(getLatLngObj(example.tle, example.timestamp))
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
