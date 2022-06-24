export default async (req, res) => {
    const { page } = req.query
    const tleRes = await fetch(`http://tle.ivanstanojevic.me/api/tle/?page=${page}&page-size=100`)
    const data = await tleRes.json()
    res.status(200).json(data)
}
