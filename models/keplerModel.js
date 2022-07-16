import { Schema, model, models } from 'mongoose'
import keplerianAttribs from './keplerAttrib.js'

const keplerianSchema = new Schema({
    name: { type: String, required: true },
    attribs: {
        type: [Number],
        required: true,
        validate: [
            arr => arr?.length === keplerianAttribs.length,
            `attrib array must be of length ${keplerianAttribs.length}`
        ]
    }
})

const Keplerian = models?.Keplerian || model('Keplerian', keplerianSchema)

export default Keplerian
