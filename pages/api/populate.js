import mongoose from 'mongoose'
import connectMongo from '../../util/connect-mongo.js'
import Keplerian from '../../models/keplerModel.js'
import { tleToKeplerian, validateTle } from '../../lib/tle-help.js'

const getTlePageCount = () => {
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
        .then(data => {
            let keps = []
            data.member.forEach(el => {
                if (!validateTle(el.line1, el.line2)) return
                const keplerian = tleToKeplerian(el.name, el.line1, el.line2)
                keps.push(keplerian)
            })
            console.log(`${keps.length} added from page ${page}`)
            return Keplerian.insertMany(keps)
        })
        .catch(err => console.log(err))
}

const populateKeplerian = async (req, res) => {
    const maxPage = await getTlePageCount()

    await connectMongo()
    const collections = await mongoose.connection.db.listCollections({ name: 'keplerians' }).toArray()
    if (collections) {
        await Keplerian.collection.drop()
        console.log('collection reset')
    }

    console.log('inserting pages:')
    for(let i = 1; i <= maxPage; i++) {
        await getPage(i)
    }

    console.log('data updated')
    res.status(200).end()
}

export default populateKeplerian
