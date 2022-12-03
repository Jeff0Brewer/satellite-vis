import { isTouchDevice } from './touch.js'

const getScreenDimensions = () => {
    let width, height
    if (isTouchDevice()) {
        if (window.screen.orientation.type.includes('landscape')) {
            width = window.screen.availHeight
            height = window.screen.availWidth
        } else {
            width = window.screen.availWidth
            height = window.screen.availHeight
        }
    } else {
        width = window.innerWidth * window.devicePixelRatio
        height = window.innerHeight * window.devicePixelRatio
    }
    width = window.innerWidth * window.devicePixelRatio
    height = window.innerHeight * window.devicePixelRatio
    return { width, height }
}

export {
    getScreenDimensions
}
