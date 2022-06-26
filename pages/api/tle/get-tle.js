const validateTle = (line1, line2) => {
    if (line1.charAt(0) !== '1' || line2.charAt(0) !== '2') {
        return false
    }
    for(const spaceInd of [1, 8, 17, 32, 43, 52, 61, 63]) {
        if (line1.charAt(spaceInd) !== ' ') return false
    }
    for(const spaceInd of [1, 7, 16, 25, 33, 42, 51]) {
        if (line2.charAt(spaceInd) !== ' ') return false
    }
    return true
}

const getTleData = async (page) => {
    return await fetch(`http://tle.ivanstanojevic.me/api/tle/?page-size=100&page=${page}`)
        .then(res => res.json())
        .then(tleData => {
            let data = {
                totalItems: tleData.totalItems,
                page: parseInt(page),
                member: []
            }
            tleData.member.forEach(tle => {
                if (!validateTle(tle.line1, tle.line2)) return
                data.member.push({
                    name: tle.name,
                    tle: [tle.line1, tle.line2],
                    timestamp: Date.parse(tle.date)
                })
            })
            return data
        })
        .catch(err => console.log(err))
}

export default getTleData
