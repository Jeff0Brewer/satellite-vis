import { sgp4, twoline2satrec } from 'satellite.js'
import elementsFromPosVel from '../lib/keplerian.js'

test('elementsFromPosVal returns full element set', () => {
    const tle = [
        '1 25544C 98067A   22218.25277778  .00090838  00000-0  15651-2 0   607',
        '2 25544  51.6419  88.5778 0004944  86.3325 121.2164 15.50379013    11'
    ]
    const satrec = twoline2satrec(tle[0], tle[1])
    const { position, velocity } = sgp4(satrec, 1000)
    const res = elementsFromPosVel(position, velocity)

    const properties = ['ecc', 'axis', 'incl', 'lan', 'argp', 'anom']
    properties.forEach(property => {
        expect(res).toHaveProperty(property)
    })
})
