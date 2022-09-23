import { newEpoch, getEpochDisplay } from '../lib/shared-epoch.js'

test('newEpoch returns correct timestamp', () => {
    const ms = 1663891235384
    const date = new Date(ms)
    const epoch = newEpoch(date)
    expect(epoch[0]).toBe(ms)
})

test('newEpoch returns SharedArrayBuffer backed array', () => {
    const epoch = newEpoch(new Date())
    expect(epoch.buffer instanceof SharedArrayBuffer).toBeTruthy()
})

test('getEpochDisplay returns properly formatted string', () => {
    const ms = 1343891235384
    const epoch = newEpoch(new Date(ms))
    const epochRegex = /\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2} [ap]m/
    expect(getEpochDisplay(epoch).match(epochRegex)).toBeTruthy()
})
