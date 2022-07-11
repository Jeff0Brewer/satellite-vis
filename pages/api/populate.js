import mongoose from 'mongoose'
import connectMongo from '../../lib/connect-mongo.js'
import Keplerian from '../../models/keplerModel.js'
import { tleToKeplerian, validateTle, getTlePageCount } from '../../lib/tle-help.js'

const getPage = page => {
    return fetch(`http://tle.ivanstanojevic.me/api/tle/?page-size=100&page=${page}`)
        .then(res => res.json())
        .then(res => {
            let keps = []
            res.member.forEach(el => {
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
