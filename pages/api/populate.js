import mongoose from 'mongoose'
import connectMongo from '../../util/connect-mongo.js'
import Tle from '../../models/tleModel.js'
import { getCatalogNumber } from '../../lib/tle.js'
import celesGroups from '../../util/celes-groups.js'

const addGroup = (category, group, seenIds) => {
    return fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=TLE`)
        .then(res => res.text())
        .then(text => {
            const data = text.split('\n').map(line => line.replace(/[\r]/g, '').trim())
            const tles = []
            for (let i = 0; i+2 < data.length; i += 3) {
                const line1 = data[i+1]
                const line2 = data[i+2]
                const id = getCatalogNumber(line1, line2)
                if (!seenIds.has(id)) {
                    tles.push({
                        name: data[i],
                        category: category,
                        satelliteId: id,
                        line1: line1,
                        line2: line2
                    })
                }
                seenIds.add(id)
            }
            return Tle.insertMany(tles, { ordered: false })
        })
}

const populateTles = async (req, res) => {
    await connectMongo()
    const collections = await mongoose.connection.db.listCollections({ name: 'tles' }).toArray()
    if (collections.length) {
        await Tle.collection.drop()
        console.log('COLLECTION RESET')
    }

    const groups = []
    const seenIds = new Set()
    for (const category in celesGroups) {
        for (const group of celesGroups[category]) {
            groups.push(addGroup(category, group, seenIds))
        }
    }
    const data = await Promise.all(groups)
    let totalTles = 0
    data.forEach(group => totalTles += group.length)

    console.log(`UPDATE COMPLETE - ${totalTles} total tles`)
    res.status(200).end()
}

export default populateTles
