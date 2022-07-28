import { useEffect } from 'react'
import { twoline2satrec } from 'satellite.js'

const DataProvider = props => {
    const getSatRecs = () => {
        fetch('/api/get-tles')
            .then(res => res.json())
            .then(data => {
                console.log(data)
                const satrecs = data
                    .map(el => twoline2satrec(el.line1, el.line2))
                    .filter(satrec => satrec.error === 0)
                props.setData(satrecs)
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

export default DataProvider
