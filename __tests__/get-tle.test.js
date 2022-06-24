import getTleData from '../pages/api/tle/get-tle.js'

test('getTleData returns valid names', () => {
    const data = getTleData(1)
    for (const name in Object.keys(data)) {
        expect(name).toBeTruthy()
    }
})

test('getTleData returns tles in valid format', () => {
    const data = getTleData(1)
    for (const name in Object.keys(data)) {
        const l1 = data[name].tle[0]
        expect(l1.charAt(0)).toBe('1')
        for(const spaceInd in [1, 8, 17, 32, 43, 52, 61, 63]) {
            expect(l1.charAt(spaceInd)).toBe(' ')
        }

        const l2 = data[name].tle[1]
        expect(l2.charAt(0)).toBe('2')
        for(const spaceInd in [1, 7, 16, 25, 33, 42, 51]) {
            expect(l2.charAt(spaceInd)).toBe(' ')
        }
    }
})

test('getTleData returns valid timestamps', () => {
    const data = getTleData(1)
    for (const name in Object.keys(data)) {
        expect(data[name].timestamp).toBeGreaterThan(0)
    }
})

beforeEach(() => {
    fetchMock.mockOnce(`
        {
          '@context': 'https://www.w3.org/ns/hydra/context.jsonld',
          '@id': 'https://tle.ivanstanojevic.me/api/tle/',
          '@type': 'Tle[]',
          totalItems: 14741,
          member: [
            {
              '@id': 'https://tle.ivanstanojevic.me/api/tle/43119',
              '@type': 'Tle',
              satelliteId: 43119,
              name: "FLOCK 3P'-3",
              date: '2022-06-23T16:10:47+00:00',
              line1: '1 43119C 18004J   22174.67415509  .00003749  00000-0  14083-3 0  1741',
              line2: '2 43119  97.3751 248.6573 0008322 352.4228 102.6184 15.27212577    10'
            },
            {
              '@id': 'https://tle.ivanstanojevic.me/api/tle/24920',
              '@type': 'Tle',
              satelliteId: 24920,
              name: 'FORTE',
              date: '2022-06-23T01:39:28+00:00',
              line1: '1 24920U 97047A   22174.06907682  .00000107  00000+0  68206-4 0  9991',
              line2: '2 24920  69.9547  56.8019 0020043 101.1893 259.1482 14.26542206291061'
            },
            {
              '@id': 'https://tle.ivanstanojevic.me/api/tle/47963',
              '@type': 'Tle',
              satelliteId: 47963,
              name: 'DIY-1 (ARDUIQUBE)',
              date: '2022-06-23T11:52:17+00:00',
              line1: '1 47963U 21022AH  22174.49464522  .00013055  00000+0  72593-3 0  9990',
              line2: '2 47963  97.5319  75.7837 0019119 108.7939 251.5368 15.13650752 67862'
            },
            {
              '@id': 'https://tle.ivanstanojevic.me/api/tle/28628',
              '@type': 'Tle',
              satelliteId: 28628,
              name: 'INMARSAT 4-F1',
              date: '2022-06-23T06:34:36+00:00',
              line1: '1 28628U 05009A   22174.27403557 -.00000263  00000+0  00000+0 0  9999',
              line2: '2 28628   3.6160  35.1596 0002806  63.9712  54.4223  1.00271305 63083'
            },
            {
              '@id': 'https://tle.ivanstanojevic.me/api/tle/46810',
              '@type': 'Tle',
              satelliteId: 46810,
              name: 'TIANQI-6',
              date: '2022-06-23T10:47:18+00:00',
              line1: '1 46810U 20076D   22174.44951594  .00001033  00000+0  10237-3 0  9993',
              line2: '2 46810  35.0047 218.1883 0013082 114.1782 246.0277 14.92066424 90341'
            },
            {
              '@id': 'https://tle.ivanstanojevic.me/api/tle/43111',
              '@type': 'Tle',
              satelliteId: 43111,
              name: 'CARTOSAT-2F',
              date: '2022-06-23T13:29:09+00:00',
              line1: '1 43111U 18004A   22174.56191419  .00003734  00000+0  18042-3 0  9999',
              line2: '2 43111  97.4474 234.8924 0004156  35.7062  95.6714 15.19241125246474'
            },
            {
              '@id': 'https://tle.ivanstanojevic.me/api/tle/43940',
              '@type': 'Tle',
              satelliteId: 43940,
              name: 'AOBA VELOX-IV',
              date: '2022-06-23T08:16:22+00:00',
              line1: '1 43940U 19003J   22174.34469999  .00030197  00000+0  80972-3 0  9990',
              line2: '2 43940  97.1259 210.0182 0019748 122.1562 238.1603 15.37725744191039'
            },
            {
              '@id': 'https://tle.ivanstanojevic.me/api/tle/27848',
              '@type': 'Tle',
              satelliteId: 27848,
              name: 'CUBESAT XI-IV (CO-57)',
              date: '2022-06-23T05:30:37+00:00',
              line1: '1 27848U 03031J   22174.22960217  .00000185  00000+0  10321-3 0  9994',
              line2: '2 27848  98.6823 182.3472 0011014  98.6405 261.6021 14.22013733984503'
            },
            {
              '@id': 'https://tle.ivanstanojevic.me/api/tle/39260',
              '@type': 'Tle',
              satelliteId: 39260,
              name: 'FENGYUN 3C',
              date: '2022-06-23T11:43:46+00:00',
              line1: '1 39260U 13052A   22174.48873805  .00000045  00000+0  43928-4 0  9998',
              line2: '2 39260  98.4528 202.2974 0009833 256.8233 103.1850 14.15927675452776'
            }
          ],
          parameters: {
            search: '*',
            sort: 'popularity',
            'sort-dir': 'desc',
            page: 2,
            'page-size': 100
          },
          view: {
            '@id': 'https://tle.ivanstanojevic.me/api/tle/?page-size=100&page=2',
            '@type': 'PartialCollectionView',
            first: 'https://tle.ivanstanojevic.me/api/tle/?page-size=100&page=1',
            previous: 'https://tle.ivanstanojevic.me/api/tle/?page-size=100&page=1',
            next: 'https://tle.ivanstanojevic.me/api/tle/?page-size=100&page=3',
            last: 'https://tle.ivanstanojevic.me/api/tle/?page-size=100&page=148'
          }
        }
    `)
})
