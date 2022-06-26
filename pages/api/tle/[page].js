import { getTleData } from './get-tle.js'

export default async (req, res) => {
    const { page } = req.query
    const data = await getTleData(page)
        .catch(err => console.log(err))
    res.status(200).json(data)
}
