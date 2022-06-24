import getTleData from '../pages/api/tle/get-tle.js'

const defaultFetch = global.fetch

test('getTleData returns non-zero number of entries', async () => {
    const data = await getTleData(1)
        .catch(err => console.log(err))

    const keys = Object.keys(data)
    expect(keys.length).toBeGreaterThan(0)
})

test('getTleData returns valid names', async () => {
    const data = await getTleData(1)
        .catch(err => console.log(err))

    for (const name in data) {
        expect(name).toBeTruthy()
    }
})

test('getTleData returns tles in valid format', async () => {
    const data = await getTleData(1)
        .catch(err => console.log(err))

    for (const name in data) {
        const l1 = data[name].tle[0]
        expect(l1.charAt(0)).toBe('1')
        for(const spaceInd of [1, 8, 17, 32, 43, 52, 61, 63]) {
            expect(l1.charAt(spaceInd)).toBe(' ')
        }

        const l2 = data[name].tle[1]
        expect(l2.charAt(0)).toBe('2')
        for(const spaceInd of [1, 7, 16, 25, 33, 42, 51]) {
            expect(l2.charAt(spaceInd)).toBe(' ')
        }
    }
})

test('getTleData returns valid timestamps', async () => {
    const data = await getTleData(1)
        .catch(err => console.log(err))

    for (const name in data) {
        expect(data[name].timestamp).toBeGreaterThan(0)
    }
})

beforeEach(() => {
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
                    },
                    {
                        "@id": "https://tle.ivanstanojevic.me/api/tle/43722",
                        "@type": "Tle",
                        "satelliteId": 43722,
                        "name": "CENTAURI-2",
                        "date": "2022-06-23T11:15:04+00:00",
                        "line1": "1 43722U 18096D   22174.46880480  .00021342  00000+0  53795-3 0  9999",
                        "line2": "2 43722  97.3556 256.2858 0012418  35.0211 325.1850 15.39821928199000"
                    },
                    {
                        "@id": "https://tle.ivanstanojevic.me/api/tle/47966",
                        "@type": "Tle",
                        "satelliteId": 47966,
                        "name": "CENTAURI-3 (TYVAK-0210)",
                        "date": "2022-06-23T19:29:55+00:00",
                        "line1": "1 47966U 21023B   22174.81244402  .00003364  00000+0  23217-3 0  9994",
                        "line2": "2 47966  45.0016 206.8781 0006549 320.3333  39.7063 15.07757527 69002"
                    },
                    {
                        "@id": "https://tle.ivanstanojevic.me/api/tle/43694",
                        "@type": "Tle",
                        "satelliteId": 43694,
                        "name": "PROXIMA I",
                        "date": "2022-06-23T08:35:51+00:00",
                        "line1": "1 43694U 18088E   22174.35823441  .00008112  00000+0  30714-3 0  9996",
                        "line2": "2 43694  85.0294 309.0937 0019130  92.9375 267.4059 15.26567240200874"
                    },
                    {
                        "@id": "https://tle.ivanstanojevic.me/api/tle/43809",
                        "@type": "Tle",
                        "satelliteId": 43809,
                        "name": "CENTAURI-1",
                        "date": "2022-06-23T14:27:12+00:00",
                        "line1": "1 43809U 18099BD  22174.60223166  .00002222  00000+0  19908-3 0  9990",
                        "line2": "2 43809  97.6204 241.7054 0013336 244.8220 115.1619 14.96738754193691"
                    },
                    {
                        "@id": "https://tle.ivanstanojevic.me/api/tle/43696",
                        "@type": "Tle",
                        "satelliteId": 43696,
                        "name": "PROXIMA II",
                        "date": "2022-06-23T08:36:11+00:00",
                        "line1": "1 43696U 18088G   22174.35847083  .00008113  00000+0  30737-3 0  9992",
                        "line2": "2 43696  85.0295 309.1120 0019182  92.9499 267.3941 15.26546209200866"
                    },
                    {
                        "@id": "https://tle.ivanstanojevic.me/api/tle/25338",
                        "@type": "Tle",
                        "satelliteId": 25338,
                        "name": "NOAA 15",
                        "date": "2022-06-24T03:43:24+00:00",
                        "line1": "1 25338U 98030A   22175.15514627  .00000151  00000+0  81291-4 0  9990",
                        "line2": "2 25338  98.6431 204.6031 0009147 279.0355  80.9789 14.26141997254222"
                    },
                    {
                        "@id": "https://tle.ivanstanojevic.me/api/tle/48943",
                        "@type": "Tle",
                        "satelliteId": 48943,
                        "name": "QMR-KWT",
                        "date": "2022-06-23T07:39:09+00:00",
                        "line1": "1 48943U 21059BS  22174.31885821  .00006380  00000+0  33388-3 0  9991",
                        "line2": "2 48943  97.5530 304.2449 0009924  85.2365 275.0001 15.16145835 54854"
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
})

afterAll(() => {
    global.fetch = defaultFetch
})

