import mongoose from 'mongoose'
import connectMongo from '../../util/connect-mongo.js'
import Tle from '../../models/tleModel.js'
import { getCatalogNumber } from '../../lib/tle.js'
import celesGroups from '../../util/celes-groups.js'

const addGroup = group => {
    return fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=TLE`)
        .then(res => res.text())
        .then(data => {
            data = data.split('\n').map(line => line.replace(/[\r]/g, '').trim())
            let tles = []
            for (let i = 0; i+2 < data.length; i += 3) {
                const line1 = data[i+1]
                const line2 = data[i+2]
                tles.push({
                    satelliteId: getCatalogNumber(line1, line2),
                    name: data[i],
                    line1: line1,
                    line2: line2
                })
            }
            return Tle.insertMany(tles, { ordered: false })
        })
}

const populateTles = async (req, res) => {
    await connectMongo()
    const collections = await mongoose.connection.db.listCollections({ name: 'tles' }).toArray()
    if (collections.length) {
        await Tle.collection.drop()
        console.log('collection reset')
    }

    let numSatellite = 0
    for (const group of celesGroups) {
        const data = await addGroup(group)
        console.log(`${data.length} added from '${group}'`)
        numSatellite += data.length
    }

    console.log(`data updated, ${numSatellite} total entries`)
    res.status(200).end()
}

export default populateTles
