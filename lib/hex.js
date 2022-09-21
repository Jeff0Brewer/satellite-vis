const byteToHex = arr => {
    return arr.reduce((prev, curr) => prev + ('0' + curr.toString(16)).slice(-2), '')
}

const hexToByte = hex => {
    const bytes = []
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substring(i, i + 2), 16))
    }
    return bytes
}

export {
    byteToHex,
    hexToByte
}
