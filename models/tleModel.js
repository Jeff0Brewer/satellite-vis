import { Schema, model, models } from 'mongoose'

const tleSchema = new Schema({
    name: { type: String, required: true },
    satelliteId: { type: Number, required: true },
    line1: { type: String, required: true },
    line2: { type: String, required: true }
})

const Tle = models?.Tle || model('Tle', tleSchema)

export default Tle
