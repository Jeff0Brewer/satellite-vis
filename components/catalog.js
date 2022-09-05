import { useEffect } from 'react'
import { twoline2satrec } from 'satellite.js'

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
        <></>
    )
}

export default Catalog
