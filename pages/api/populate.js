import connectMongo from '../../lib/connect-mongo.js'
import Keplerian from '../../models/keplerModel.js'
import tleToKeplerian from '../../lib/tle-kepler.js'

const validateTle = (line1, line2) => {
    const valid1 = /^1 .{6} .{8} .{14} .{10} .{8} .{8} . .{5}$/.test(line1)
    const valid2 = /^2 .{5} .{8} .{8} .{7} .{8} .{8} .{17}$/.test(line2)
    return valid1 && valid2
}

const getMaxPage = () => {
    return fetch('http://tle.ivanstanojevic.me/api/tle/?page-size=100&page=1')
        .then(res => res.json())
        .then(res => { 
            const lastUrl = res.view.last
            const pageNumber = lastUrl.substring(lastUrl.lastIndexOf('=') + 1)
            return parseInt(pageNumber)
        })
        .catch(err => console.log(err))
}

const getPage = page => {
    return fetch(`http://tle.ivanstanojevic.me/api/tle/?page-size=100&page=${page}`)
        .then(res => res.json())
        .then(res => {
            let keps = []
            res.member.forEach(el => {
                console.log(el.line1 + '\n' + el.line2)
                if (!validateTle(el.line1, el.line2)) return
                const keplerian = tleToKeplerian(el.name, el.line1, el.line2)
                keps.push(keplerian)
            })
            return Keplerian.insertMany(keps)
        })
        .catch(err => console.log(err))
}

const populateKeplerian = async (req, res) => {
    const maxPage = await getMaxPage()

    await connectMongo()

    await getPage(1)

    res.status(200).end()
}

export default populateKeplerian
