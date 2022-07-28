import { validateTleChecksum, validateTleLine1, validateTleLine2, getEccentricity, getInclination, getArgumentPerigee, getRAAN, getMeanMotion, getMeanAnomaly } from '../lib/tle.js'

test('getEccentricity returns correct value', () => {
    const line1 = "1 44252U 19029T   22206.44213736  .00061111  00000+0  13529-2 0  9991"
    const line2 = "2 44252  52.9947 286.2236 0003334  26.4946 333.6228 15.43229799174783"
    expect(getEccentricity(line1, line2)).toBe(.0003334)
})

test('getInclination returns correct value', () => {
    const line1 = "1 44252U 19029T   22206.44213736  .00061111  00000+0  13529-2 0  9991"
    const line2 = "2 44252  52.9947 286.2236 0003334  26.4946 333.6228 15.43229799174783"
    expect(getInclination(line1, line2)).toBe(52.9947 * Math.PI / 180)
})

test('getArgumentPerigee returns correct value', () => {
    const line1 = "1 44252U 19029T   22206.44213736  .00061111  00000+0  13529-2 0  9991"
    const line2 = "2 44252  52.9947 286.2236 0003334  26.4946 333.6228 15.43229799174783"
    expect(getArgumentPerigee(line1, line2)).toBe(26.4946 * Math.PI / 180)
})

test('getRAAN returns correct value', () => {
    const line1 = "1 44252U 19029T   22206.44213736  .00061111  00000+0  13529-2 0  9991"
    const line2 = "2 44252  52.9947 286.2236 0003334  26.4946 333.6228 15.43229799174783"
    expect(getRAAN(line1, line2)).toBe(286.2236 * Math.PI / 180)
})

test('getMeanMotion returns correct value', () => {
    const line1 = "1 44252U 19029T   22206.44213736  .00061111  00000+0  13529-2 0  9991"
    const line2 = "2 44252  52.9947 286.2236 0003334  26.4946 333.6228 15.43229799174783"
    expect(getMeanMotion(line1, line2)).toBe(15.43229799)
})

test('getMeanAnomaly returns correct value', () => {
    const line1 = "1 44252U 19029T   22206.44213736  .00061111  00000+0  13529-2 0  9991"
    const line2 = "2 44252  52.9947 286.2236 0003334  26.4946 333.6228 15.43229799174783"
    expect(getMeanAnomaly(line1, line2)).toBe(333.6228 * Math.PI / 180)
})

const checksumCases = [
    ['2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537', true],
    ['2 43722  97.3552 288.1718 0010874 271.8361  88.1640 15.41221812203889', true],
    ['2 40946   3.6710 335.4757 0003267 183.6278 225.0181  1.00272119 25020', true],
    ['2 27607  64.5535 185.9971 0080157 287.1475  72.0862 14.76179786 53961', true],
    ['1 25544C 98067A   22218.25277778  .00090838  00000-0  15651-2 0   607', true],
    ['1 47966U 21023B   22205.81703648  .00006120  00000+0  40548-3 0  9990', true],
    ['1 49069U 21073D   22205.91992724  .00002496  00000+0  16081-3 0  9994', true],
    ['1 45455C 20020AH  22206.13486526  .00003377  00000-0  95404-2 0  2069', true],
    ['1 25544C 98067A   22218.25277778  .09090838  00000-0  15651-2 0   603', false],
    ['1 22041U 92043EEEE22205.67171242 -.00000193  00000+0  00000+0 0219990', false],
    ['2 45424  87.8862 303.8414 0002571 107.6120  14.5639 13.11410332    17', false]
]
describe('validateTleChecksum', () => {
    test.each(checksumCases)(
        'given %p returns %p',
        (line, expected) => {
            const result = validateTleChecksum(line)
            expect(result).toBe(expected)
        }
    )
})

const line1Cases = [
    ['1 25544C 98067A   22218.25277778  .00090838  00000-0  15651-2 0   607', true],
    ['1 47966U 21023B   22205.81703648  .00006120  00000+0  40548-3 0  9990', true],
    ['1 49069U 21073D   22205.91992724  .00002496  00000+0  16081-3 0  9994', true],
    ['1 45455C 20020AH  22206.13486526  .00003377  00000-0  95404-2 0  2069', true],
    ['1 82741U          22206.42536500  .00001434  00000+0  18136-2 0  9991', false],
    ['1 25544C 98067A   22218.25277778  .09090838  00000-0  15651-2 0   603', false],
    ['1 73247C 21115Y   21342.82A91063 -.00009798  00010-0 -23754-3 0  3424', false],
    ['1 22041U 92043EEEE22205.67171242 -.00000193  00000+0  00000+0 0219990', false],
    ['1 49069U 21073D9  22205.91992724  .00002496  00000 0  16081-3 0  9994', false],
    ['<body></body>', false],
    ['', false]
]
describe('validateTleLine1', () => {
    test.each(line1Cases)(
        'given %p returns %p',
        (line, expected) => {
            const result = validateTleLine1(line)
            expect(result).toBe(expected)
        }
    )
})

const line2Cases = [
    ['2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537', true],
    ['2 43722  97.3552 288.1718 0010874 271.8361  88.1640 15.41221812203889', true],
    ['2 40946   3.6710 335.4757 0003267 183.6278 225.0181  1.00272119 25020', true],
    ['2 27607  64.5535 185.9971 0080157 287.1475  72.0862 14.76179786 53961', true],
    ['2 45424  87.8862 303.8414 0002571 107.6120  14.5639 13.11410332    17', false],
    ['2 42759  43.0165 124.3907 0008396 175.6798 315.3611 15 12144971282077', false],
    ['2 47944  97.5243 105.1052 008999999998610  15.1597 276.1879 15.07923773    13', false],
    ['</body>', false],
    ['', false]
]
describe('validateTleLine2', () => {
    test.each(line2Cases)(
        'given %p returns %p',
        (line, expected) => {
            const result = validateTleLine2(line)
            expect(result).toBe(expected)
        }
    )
})
