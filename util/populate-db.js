import mongoose from 'mongoose'
import fetch from 'node-fetch'
import connectMongo from './connect-mongo.js'

const populate = async () => {
    await connectMongo()
    await fetch(`http://tle.ivanstanojevic.me/api/tle/?page-size=100&page=1`)
    mongoose.disconnect()
}

populate()
