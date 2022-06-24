import getTleData from './get-tle.js'

export default async (req, res) => {
    const { page } = req.query
    const data = await getTleData(page)
    res.status(200).json(data)
}
