import { sgp4, twoline2satrec } from 'satellite.js'
import elementsFromPosVel from '../lib/keplerian.js'
import { getEccentricity, getInclination, getArgumentPerigee, getRAAN, getMeanMotion, getMeanAnomaly } from '../lib/tle.js'

const tles = [
    [
        "1 25544C 98067A   22218.25277778  .00090838  00000-0  15651-2 0   607",
        "2 25544  51.6419  88.5778 0004944  86.3325 121.2164 15.50379013    11"
    ],[
        "1 44252U 19029T   22206.44213736  .00061111  00000+0  13529-2 0  9991",
        "2 44252  52.9947 286.2236 0003334  26.4946 333.6228 15.43229799174783"
    ],[
        "1 28654U 05018A   22206.52159967  .00000103  00000+0  79610-4 0  9995",
        "2 28654  98.9477 276.9250 0013651 220.4005 139.6154 14.12757208885356"
    ],[
        "1 43809U 18099BD  22206.42353408  .00000859  00000+0  79718-4 0  9999",
        "2 43809  97.6197 272.7118 0015862 137.1120 223.1342 14.96849702198454"
    ],[
        "1 07530U 74089B   22206.42834238 -.00000040  00000+0  34221-4 0  9999",
        "2 07530 101.9061 186.4213 0012119 331.2359 196.9217 12.53656041182223"
    ],[
        "1 73163C 22010E   22035.60557552 -.00859748  00000-0 -95741-3 0   355",
        "2 73163  53.2177 170.0067 0086467 162.7063 157.6728 16.01257072    12"
    ],[
        "1 31738U 99025CEM 22206.38499252  .00001197  00000+0  83829-3 0  9991",
        "2 31738  99.4627 261.3448 0333568 129.3385 233.7835 13.76658651452008"
    ],[
        "1 50213U 21126B   22008.72139705  .00001997  67395-6  41610-3 0  9996",
        "2 50213  26.9105 333.9384 8403639 185.2217 148.3798  1.04295033   195"
    ]
]

describe('elementsFromPosVel returns full element set', () => {
    const properties = ['ecc', 'incl', 'lan', 'axis', 'argp', 'anom']
    test.each(tles)(
        'tle: \n %p \n %p',
        (line1, line2) => {
            const satrec = twoline2satrec(line1, line2)
            const { position, velocity } = sgp4(satrec, 0)
            const res = elementsFromPosVel(position, velocity)
            properties.forEach(property => {
                expect(res).toHaveProperty(property)
            })
        }
    )
})

describe('elementsFromPosVel returns correct eccentricity at t=0', () => {
    test.each(tles)(
        'tle: \n %p \n %p',
        (line1, line2) => {
            const satrec = twoline2satrec(line1, line2)
            const { position, velocity } = sgp4(satrec, 0)
            const elements = elementsFromPosVel(position, velocity)
            expect(elements.ecc).toBeCloseTo(getEccentricity(line1, line2), 2)
        }
    )
})

describe('elementsFromPosVel returns correct inclination at t=0', () => {
    test.each(tles)(
        'tle: \n %p \n %p',
        (line1, line2) => {
            const satrec = twoline2satrec(line1, line2)
            const { position, velocity } = sgp4(satrec, 0)
            const elements = elementsFromPosVel(position, velocity)
            expect(elements.incl).toBeCloseTo(getInclination(line1, line2), 2)
        }
    )
})

describe('elementsFromPosVel returns correct longitude of acending node at t=0', () => {
    test.each(tles)(
        'tle: \n %p \n %p',
        (line1, line2) => {
            const satrec = twoline2satrec(line1, line2)
            const { position, velocity } = sgp4(satrec, 0)
            const elements = elementsFromPosVel(position, velocity)
            expect(elements.lan).toBeCloseTo(getRAAN(line1, line2), 3)
        }
    )
})

describe('elementsFromPosVel returns correct semimajor axis at t=0', () => {
    test.each(tles)(
        'tle: \n %p \n %p',
        (line1, line2) => {
            const satrec = twoline2satrec(line1, line2)
            const { position, velocity } = sgp4(satrec, 0)
            const elements = elementsFromPosVel(position, velocity)
            const meanMotion = getMeanMotion(line1, line2)
            const axis = Math.pow(3.986004418 * Math.pow(10, 5), 1/3)/Math.pow(2*Math.PI*meanMotion/86400, 2/3)
            expect(Math.abs(elements.axis - axis)).toBeLessThan(10)
        }
    )
})

//describe('elementsFromPosVel returns correct anomaly axis at t=0', () => {
//    test.each(tles)(
//        'tle: \n %p \n %p',
//        (line1, line2) => {
//            const satrec = twoline2satrec(line1, line2)
//            const { position, velocity } = sgp4(satrec, 0)
//            const elements = elementsFromPosVel(position, velocity)
//            expect(elements.anom).toBeCloseTo(getMeanAnomaly(line1, line2), 2)
//        }
//    )
//})

//describe('elementsFromPosVel returns correct argument of perigee at t=0', () => {
//    test.each(tles)(
//        'tle: \n %p \n %p',
//        (line1, line2) => {
//            const satrec = twoline2satrec(line1, line2)
//            const { position, velocity } = sgp4(satrec, 0)
//            const elements = elementsFromPosVel(position, velocity)
//            expect(elements.argp).toBeCloseTo(getArgumentPerigee(line1, line2), 2)
//        }
//    )
//})
