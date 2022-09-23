import Bowser from 'bowser'

const getBrowserName = window => {
    const browser = Bowser.getParser(window.navigator.userAgent)
    const { name } = browser.getBrowser()
    return name
}

export {
    getBrowserName
}
