export default async (req, res) => {
    const tleRes = await fetch('http://tle.ivanstanojevic.me/api/tle')
    const data = await tleRes.json()
    res.status(200).json(data)
}
