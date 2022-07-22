import { Schema, model, models } from 'mongoose'

const keplerianSchema = new Schema({
    name: { type: String, required: true },
    axis: { type: Number, required: true },
    eccentricity: { type: Number, required: true },
    periapsis: { type: Number, required: true },
    lngAcendingNode: { type: Number, required: true },
    inclination: { type: Number, required: true },
    anomaly: { type: Number, required: true },
    year: { type: Number, required: true },
    day: { type: Number, required: true },
    second: { type: Number, required: true }
})

const Keplerian = models?.Keplerian || model('Keplerian', keplerianSchema)

export default Keplerian
