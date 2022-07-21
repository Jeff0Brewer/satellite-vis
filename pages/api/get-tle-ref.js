import { validateTle } from '../../lib/tle-help.js'

const getTleReference = async (req, res) => {
    const tleRes = await fetch('https://tle.ivanstanojevic.me/api/tle/?search=ISS')
    const data = await tleRes.json()
    let i = 0
    while (i < data.totalItems) {
        const tle = [data.member[i].line1, data.member[i].line2]
        if (validateTle(tle[0], tle[1])) {
            res.status(200).json({
                name: data.member[i].name,
                tle: tle
            })
            return
        }
    }
    res.status(404).send('NO VALID TLE FOUND')
}

export default getTleReference
