const validateTle = (line1, line2) => {
    const valid1 = /^1 .{6} .{8} .{14} .{10} .{8} .{8} . .{5}$/.test(line1)
    const valid2 = /^2 .{5} .{8} .{8} .{7} .{8} .{8} .{17}$/.test(line2)
    return valid1 && valid2
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
