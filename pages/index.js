import React, { useEffect } from 'react'
import styles from '../styles/Home.module.css'

const Home = () => {
    const getData = async () => {
        const res = await fetch('/api/tle/2')
        const data = await res.json()
        console.log(data)
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
