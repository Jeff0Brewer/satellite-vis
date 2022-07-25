import { Schema, model, models } from 'mongoose'
import { validateTleLine1, validateTleLine2 } from '../lib/tle.js'

const tleSchema = new Schema({
    satelliteId: { type: Number, required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    line1: { 
        type: String, 
        required: true,
        validate: [validateTleLine1, 'tle line 1 invalid']
    },
    line2: { 
        type: String, 
        required: true,
        validate: [validateTleLine2, 'tle line 2 invalid']
    },
})

const Tle = models?.Tle || model('Tle', tleSchema)

export default Tle
