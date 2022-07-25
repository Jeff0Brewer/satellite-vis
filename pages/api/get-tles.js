import mongoose from 'mongoose'
import connectMongo from '../../util/connect-mongo.js'
import Tle from '../../models/tleModel.js'

const getTles = async (req, res) => {
    await connectMongo()
    const tles = await Tle.find()
    res.status(200).json(tles)
}

export default getTles
