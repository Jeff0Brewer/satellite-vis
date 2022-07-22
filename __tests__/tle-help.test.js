import { tleToKeplerian, degToRad, motionToAxis, validateTle, getTlePageCount } from '../lib/tle-help.js'
import keplerianAttribs from '../models/keplerAttrib.js'

const line1 = "1 25544U 98067A   22187.91168981  .00005281  00000+0  10097-3 0  9998"
const line2 = "2 25544  51.6429 238.9000 0004438 341.2767   1.5583 15.49849532348232"

test('degToRad correct for angle of 0', () => {
    expect(degToRad(0)).toBe(0)
})

test('degToRad correct for angle of 360', () => {
    expect(degToRad(360)).toBe(Math.PI*2)
})

test('motionToAxis calculates correct semimajor axis for ISS', () => {
    const ISSmeanMotion = 15.4984953
    const ISSmajorAxis = 6795302.856642774

    expect(motionToAxis(ISSmeanMotion)).toBe(ISSmajorAxis)
})

test('tleToKeplerian returns complete keplerian element set', () => {
    const k = tleToKeplerian('name', line1, line2)

    expect(k).toHaveProperty('name')
    expect(k?.attribs.length).toBe(keplerianAttribs.length)
})

test('tleToKeplerian returns correct axis attribute', () => {
    const k = tleToKeplerian('name', line1, line2)
    const attrib = k?.attribs[keplerianAttribs.indexOf('aAxis')]
    expect(attrib).toBeCloseTo(6795302.85, 2)
})

test('tleToKeplerian returns correct eccentricity attribute', () => {
    const k = tleToKeplerian('name', line1, line2)
    const attrib = k?.attribs[keplerianAttribs.indexOf('aEccentricity')]
    expect(attrib).toBeCloseTo(0.0004438, 7)
})

test('tleToKeplerian returns correct periapsis attribute', () => {
    const k = tleToKeplerian('name', line1, line2)
    const attrib = k?.attribs[keplerianAttribs.indexOf('aPeriapsis')]
    expect(attrib).toBeCloseTo(5.956402, 5)
})

test('tleToKeplerian returns correct longitude of acending node attribute', () => {
    const k = tleToKeplerian('name', line1, line2)
    const attrib = k?.attribs[keplerianAttribs.indexOf('aLngAcendingNode')]
    expect(attrib).toBeCloseTo(4.169591, 5)
})

test('tleToKeplerian returns correct inclination attribute', () => {
    const k = tleToKeplerian('name', line1, line2)
    const attrib = k?.attribs[keplerianAttribs.indexOf('aInclination')]
    expect(attrib).toBeCloseTo(0.901338, 5)
})

test('tleToKeplerian returns correct anomaly attribute', () => {
    const k = tleToKeplerian('name', line1, line2)
    const attrib = k?.attribs[keplerianAttribs.indexOf('aAnomaly')]
    expect(attrib).toBeCloseTo(0.027197, 5)
})

test('tleToKeplerian returns correct year attribute', () => {
    const k = tleToKeplerian('name', line1, line2)
    const attrib = k?.attribs[keplerianAttribs.indexOf('aYear')]
    expect(attrib).toBeCloseTo(22, 2)
})

test('tleToKeplerian returns correct day attribute', () => {
    const k = tleToKeplerian('name', line1, line2)
    const attrib = k?.attribs[keplerianAttribs.indexOf('aDay')]
    expect(attrib).toBeCloseTo(187, 2)
})

test('tleToKeplerian returns correct second attribute', () => {
    const k = tleToKeplerian('name', line1, line2)
    const attrib = k?.attribs[keplerianAttribs.indexOf('aSecond')]
    expect(attrib).toBeCloseTo(.91168981*86400, 1)
})

test('validateTle returns true for valid input', () => {
    const line1 = "1 25544C 98067A   22188.25277778 -.00045535  00000-0 -79974-3 0   608"
    const line2 = "2 25544  51.6410 237.2145 0005099 341.7889 105.4438 15.49870784    15"

    expect(validateTle(line1, line2)).toBe(true)
})

test('validateTle returns false for invalid input', () => {
    const line1 = "<body></body>"
    const line2 = "25543241234.2341234.124124.5323452354.341234235643   234 .324 324 .34"

    expect(validateTle(line1, line2)).toBe(false)
})

test('getTlePageCount returns correct page number', async () => {
    const defaultFetch = global.fetch
    global.fetch = () => 
        Promise.resolve({
            json: () => Promise.resolve({
                "@context": "https://www.w3.org/ns/hydra/context.jsonld",
                "@id": "https://tle.ivanstanojevic.me/api/tle/",
                "@type": "Tle[]",
                "totalItems": 14742,
                "member": [
                    {
                        "@id": "https://tle.ivanstanojevic.me/api/tle/25544",
                        "@type": "Tle",
                        "satelliteId": 25544,
                        "name": "ISS [Segment 60]",
                        "date": "2022-07-07T06:04:00+00:00",
                        "line1": "1 25544C 98067A   22188.25277778 -.00045535  00000-0 -79974-3 0   608",
                        "line2": "2 25544  51.6410 237.2145 0005099 341.7889 105.4438 15.49870784    15"
                    }
                ],
                "parameters": {
                    "search": "*",
                    "sort": "popularity",
                    "sort-dir": "desc",
                    "page": 1,
                    "page-size": 100
                },
                "view": {
                    "@id": "https://tle.ivanstanojevic.me/api/tle/?page-size=100&page=1",
                    "@type": "PartialCollectionView",
                    "first": "https://tle.ivanstanojevic.me/api/tle/?page-size=100&page=1",
                    "next": "https://tle.ivanstanojevic.me/api/tle/?page-size=100&page=2",
                    "last": "https://tle.ivanstanojevic.me/api/tle/?page-size=100&page=148"
                }
            })
        })

    const count = await getTlePageCount()
    expect(count).toBe(148)

    global.fetch = defaultFetch
})
