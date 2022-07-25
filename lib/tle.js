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
    const line1Regex = /^1 \d{5}[UCS] \d{5}[A-Z ]{3} \d{5}\.\d{8} [- ]\.\d{8} [-+ ]\d{5}[+-]\d [-+ ]\d{5}[+-]\d \d [\d ]{4}\d$/
    return !!line1.match(line1Regex) && validateTleChecksum(line1)
}


const validateTleLine2 = line2 => {

}


export {
    validateTleChecksum,
    validateTleLine1,
    validateTleLine2
}
