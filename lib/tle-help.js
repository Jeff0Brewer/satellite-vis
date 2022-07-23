const getChecksum = line => {
    let sum = 0
    const chars = line.substring(0, line.length - 1).split('')
    chars.forEach(char => {
        if (char >= '0' && char <= '9') {
            sum += parseInt(char)
        }
        else if (char === '-') {
            sum += 1
        }
    })
    return sum % 10
}

const validateTle = (line1, line2) => {
    const valid1 = /^1 .{6} .{8} .{14} .{10} .{8} .{8} . .{5}$/.test(line1)
    const valid2 = /^2 .{5} .{8} .{8} .{7} .{8} .{8} .{17}$/.test(line2)
    if (!(valid1 && valid2)) return false
    const check1 = getChecksum(line1) == line1.substring(line1.length - 1)
    const check2 = getChecksum(line2) == line2.substring(line2.length - 1)
    return check1 && check2
}

const getTlePageCount = () => {
    return fetch('http://tle.ivanstanojevic.me/api/tle/?page-size=100&page=1')
        .then(res => res.json())
        .then(res => { 
            const lastUrl = res.view.last
            const pageNumber = lastUrl.substring(lastUrl.lastIndexOf('=') + 1)
            return parseInt(pageNumber)
        })
        .catch(err => console.log(err))
}

export {
    validateTle,
    getTlePageCount
}
