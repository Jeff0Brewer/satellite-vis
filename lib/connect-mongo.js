import 'dotenv/config'
import mongoose from 'mongoose'

const connectMongo = () => {
    return mongoose.connect(process.env.MONGO_URI)
}

export default connectMongo
