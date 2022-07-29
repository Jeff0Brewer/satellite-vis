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
        "1 48928U 21059BB  22206.36763380  .00004325  00000+0  22434-3 0  9997",
        "2 48928  97.5616 336.5942 0013856 332.2799  27.7694 15.16607442 59721"
    ],[
        "1 35932U 09051B   22206.56210687  .00000411  00000+0  10262-3 0  9993",
        "2 35932  98.5651  63.5568 0006414 296.0587  63.9949 14.56907919681649"
    ],[
        "1 38340U 12025D   22206.15464114  .00001026  00000+0  15405-3 0  9992",
        "2 38340  98.1940 285.1122 0012722 106.0841 254.1769 14.76730318537803"
    ],[
        "1 48272U 21034E   22206.53527987  .00002106  00000+0  23843-3 0  9992",
        "2 48272  97.7456 277.1571 0002412  80.3836 279.7632 14.87463315 67225"
    ],[
        "1 43669U 18083H   22206.52050676  .00008739  00000+0  38248-3 0  9995",
        "2 43669  97.4132 230.6424 0009360 186.5161 330.0759 15.22244358207094"
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

describe('elementsFromPosVel returns correct overall angle at t=0', () => {
    test.each(tles)(
        'tle: \n %p \n %p',
        (line1, line2) => {
            const satrec = twoline2satrec(line1, line2)
            const { position, velocity } = sgp4(satrec, 0)
            const elements = elementsFromPosVel(position, velocity)

            const calcAngle = (elements.anom + elements.argp) % (Math.PI*2)
            const tleAngle = (getArgumentPerigee(line1, line2) + getMeanAnomaly(line1, line2)) % (Math.PI*2)
            const offsetPi = angle => (angle + Math.PI) % (2*Math.PI)
            const angleDiff = Math.min(Math.abs(tleAngle - calcAngle), Math.abs(offsetPi(tleAngle) - offsetPi(calcAngle)))
            expect(angleDiff).toBeLessThan(Math.PI/10)
        }
    )
})

describe('elementsFromPosVel returns consistent values over .2 second period', () => {
    const line1 = "1 28654U 05018A   22206.52159967  .00000103  00000+0  79610-4 0  9995"
    const line2 = "2 28654  98.9477 276.9250 0013651 220.4005 139.6154 14.12757208885356"
    const satrec = twoline2satrec(line1, line2)
    const { position: pos0, velocity: vel0 } = sgp4(satrec, 0)
    const elem0 = elementsFromPosVel(pos0, vel0)
    const { position: pos1, velocity: vel1 } = sgp4(satrec, 200)
    const elem1 = elementsFromPosVel(pos1, vel1)

    test('eccentricity', () => {
        expect(elem1.ecc).toBeCloseTo(elem0.ecc, 3)
    })
    test('inclination', () => {
        expect(elem1.incl).toBeCloseTo(elem0.incl, 2)
    })
    test('longitude of ascending node', () => {
        expect(elem1.lan).toBeCloseTo(elem0.lan, 2)
    })
    test('semimajor axis', () => {
        expect(Math.abs(elem0.axis - elem1.axis)).toBeLessThan(10)
    })
})

