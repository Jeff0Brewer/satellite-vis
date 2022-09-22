import 'dotenv/config'
import mongoose from 'mongoose'
import connectMongo from '../../util/connect-mongo.js'
import Tle from '../../models/tleModel.js'
import { getCatalogNumber } from '../../lib/tle.js'
import { noradGroups, supplementalGroups } from '../../util/celes-groups.js'

const getNoradUrl = group => 
    `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=TLE`
const getSupplementalUrl = group => 
    `https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=${group}&FORMAT=tle`

const addGroup = (category, url, seenIds) => {
    return fetch(url)
        .then(res => res.text())
        .then(text => {
            const data = text.split('\n').map(line => line.replace(/[\r]/g, '').trim())
            const tles = []
            for (let i = 0; i+2 < data.length; i += 3) {
                const name = data[i]
                const line1 = data[i+1]
                const line2 = data[i+2]
                const id = getCatalogNumber(line1, line2)
                const checkedCategory = (name + '!').match(/ DEB(?:[ )!])?/) ? 'Debris' : category
                if (!seenIds.has(id)) {
                    tles.push({
                        name: name,
                        category: checkedCategory,
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

const addGroups = (groups, groupToUrl, seenIds) => {
    const out = []
    for (const category in groups) {
        for (const group of groups[category]) {
            out.push(addGroup(category, groupToUrl(group), seenIds))
        }
    }
    return out
}

const populateTles = async (req, res) => {
    if (req.headers?.authorization !== process.env.POPULATE_KEY) {
        console.log('POPULATE AUTHENTICATION FAILED')
        return res.status(401).send({
            'status': 'error',
            'message': 'unauthorized'
        })
    }
    await connectMongo()
    const collections = await mongoose.connection.db.listCollections({ name: 'tles' }).toArray()
    if (collections.length) {
        await Tle.collection.drop()
        console.log('COLLECTION RESET')
    }

    const seenIds = new Set()
    const groups = [
        ...addGroups(supplementalGroups, getSupplementalUrl, seenIds),
        ...addGroups(noradGroups, getNoradUrl, seenIds)
    ]
    const data = await Promise.all(groups)

    let totalTles = 0
    data.forEach(group => totalTles += group.length)
    console.log(`UPDATE COMPLETE - ${totalTles} total tles`)

    res.status(200).send({
        'status': 'success',
        'data': { 'num-tles': totalTles }
    })
}

export default populateTles
