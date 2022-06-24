const getTleData = async (page) => {
    const tleRes = await fetch(`http://tle.ivanstanojevic.me/api/tle/?page-size=100&page=${page}`)
    const tleData = await tleRes.json()
    let data = {}
    tleData.member.forEach(tle => {
        data[tle.name] = {
            tle: [tle.line1, tle.line2],
            timestamp: Date.parse(tle.date)
        }
    })
    return data
}

export default getTleData
