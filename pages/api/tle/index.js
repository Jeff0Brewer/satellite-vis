import { getTleData } from './get-tle.js'

export default async (req, res) => {
    const data = await getTleData(1)
        .catch(err => console.log(err))
    res.status(200).json(data)
}
