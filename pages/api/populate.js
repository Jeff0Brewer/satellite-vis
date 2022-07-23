import mongoose from 'mongoose'
import connectMongo from '../../lib/connect-mongo.js'
import Tle from '../../models/tleModel.js'
import { validateTle, getTlePageCount } from '../../lib/tle-help.js'

const getPage = page => {
    return fetch(`http://tle.ivanstanojevic.me/api/tle/?page-size=100&page=${page}`)
        .then(res => res.json())
        .then(data => {
            let tles = []
            data.member.forEach(el => {
                if (!el?.name || !el?.satelliteId || !validateTle(el?.line1, el?.line2)) return
                tles.push({
                    name: el.name,
                    satelliteId: el.satelliteId,
                    line1: el.line1,
                    line2: el.line2
                })
            })
            return Tle.insertMany(tles)
        })
        .catch(err => console.log(err))
}

const populateTles = async (req, res) => {
    const maxPage = await getTlePageCount()

    await connectMongo()
    const collections = await mongoose.connection.db.listCollections({ name: 'tles' }).toArray()
    if (collections) {
        await Tle.collection.drop()
        console.log('collection reset')
    }

    console.log('inserting pages:')
    for(let i = 1; i <= maxPage; i++) {
        await getPage(i)
        console.log(i)
    }

    console.log('data updated')
    res.status(200).end()
}

export default populateTles
