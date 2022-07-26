import mongoose from 'mongoose'
import connectMongo from '../../util/connect-mongo.js'
import Tle from '../../models/tleModel.js'

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
            let tles = []
            data.member.forEach(el => {
                tles.push({
                    satelliteId: el?.satelliteId,
                    name: el?.name,
                    date: el?.date,
                    line1: el?.line1,
                    line2: el?.line2
                })
            })
            return Tle.insertMany(tles, { ordered: false })
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
        const data = await getPage(i)
        console.log(`${data?.length} from page ${i} added`)
    }

    console.log('data updated')
    res.status(200).end()
}

export default populateTles
