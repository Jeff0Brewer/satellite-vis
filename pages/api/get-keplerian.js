import mongoose from 'mongoose'
import connectMongo from '../../util/connect-mongo.js'
import Keplerian from '../../models/keplerModel.js'

const getKeplerian = async (req, res) => {
    await connectMongo()
    const keps = await Keplerian.find()
    res.status(200).json(keps)
}

export default getKeplerian
