import { byteToHex, hexToByte } from '../lib/hex.js'

test('byte to hex returns correct hex string', () => {
    const bytes = [100, 55, 235, 255]
    const hex = '6437ebff'
    expect(byteToHex(bytes)).toBe(hex)
})

test('byte to hex returns correct hex string', () => {
    const bytes = [100, 55, 235, 255]
    const hex = '6437ebff'
    expect(hexToByte(hex)).toStrictEqual(bytes)
})
