import { validateTleChecksum, validateTleLine1, validateTleLine2 } from '../lib/tle.js'

const line1Cases = [
    ['1 25544C 98067A   22218.25277778  .00090838  00000-0  15651-2 0   607', true],
    ['1 47966U 21023B   22205.81703648  .00006120  00000+0  40548-3 0  9990', true],
    ['1 49069U 21073D   22205.91992724  .00002496  00000+0  16081-3 0  9994', true],
    ['1 45455C 20020AH  22206.13486526  .00003377  00000-0  95404-2 0  2069', true],
    ['1 25544C 98067A   22218.25277778  .09090838  00000-0  15651-2 0   603', false],
    ['1 73247C 21115Y   21342.82A91063 -.00009798  00010-0 -23754-3 0  3424', false],
    ['1 22041U 92043EEEE22205.67171242 -.00000193  00000+0  00000+0 0219990', false],
    ['<body></body>', false],
    ['', false]
]

describe('validateTleChecksum', () => {
    test.each(line1Cases)(
        'given %p returns %p',
        (line, expected) => {
            const result = validateTleChecksum(line)
            expect(result).toBe(expected)
        }
    )
})

describe('validateTleLine1', () => {
    test.each(line1Cases)(
        'given %p returns %p',
        (line, expected) => {
            const result = validateTleLine1(line)
            expect(result).toBe(expected)
        }
    )
})
