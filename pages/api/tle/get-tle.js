const getTleData = async (page) => {
    return await fetch(`http://tle.ivanstanojevic.me/api/tle/?page-size=100&page=${page}`)
        .then(res => res.json())
        .then(tleData => {
            let data = {}
            tleData.member.forEach(tle => {
                data[tle.name] = {
                    tle: [tle.line1, tle.line2],
                    timestamp: Date.parse(tle.date)
                }
            })
            return data
        })
        .catch(err => console.log(err))
}

export default getTleData
