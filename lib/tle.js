const validateTleChecksum = line => {
    const checksum = parseInt(line.slice(-1))
    const chars = line.slice(0, -1).split('')
    let sum = 0
    chars.forEach(ch => {
        if ('0' <= ch && ch <= '9')
            sum += parseInt(ch)
        else if (ch === '-') 
            sum += 1
    })
    return sum % 10 === checksum
}

const validateTleLine1 = line1 => {
    const valid = 
        !!line1.match(/^1 \d{5}[UCS] [\d ]{5}[A-Z ]{3} \d{5}\.\d{8} [- ]\.\d{8} [-+ ]\d{5}[+-]\d [-+ ]\d{5}[+-]\d \d [\d ]{4}\d$/) && 
        validateTleChecksum(line1)
    return valid
}

const validateTleLine2 = line2 => {
    const valid = 
        !!line2.match(/^2 \d{5} [\d ]{3}\.\d{4} [\d ]{3}\.\d{4} \d{7} [\d ]{3}\.\d{4} [\d ]{3}\.\d{4} [\d ]{2}\.\d{8}[\d ]{5}\d$/) && 
        validateTleChecksum(line2)
    return valid
}

const getCatalogNumber = (line1, line2) => {
    return line2.substring(2, 7).replace(' ', '0')
}

export {
    validateTleChecksum,
    validateTleLine1,
    validateTleLine2,
    getCatalogNumber
}
