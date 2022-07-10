import { Schema, model, models } from 'mongoose'

const keplerianAttribs = [
    'aAxis', 
    'aEccentricity', 
    'aPeriapsis', 
    'aLngAcendingNode', 
    'aInclination', 
    'aAnomoly', 
    'aEpoch'
]

const keplerianSchema = new Schema({
    name: { type: String, required: true },
    epochYear: { type: Number, required: true },
    attribs: {
        type: [Number],
        required: true,
        validate: [
            arr => arr?.length === keplerianAttribs.length,
            `attrib array must be of length ${keplerianAttribs.length}`
        ]
    }
})

const Keplerian = models.Keplerian || model('Keplerian', keplerianSchema)

export { 
    Keplerian,
    keplerianAttribs
}
