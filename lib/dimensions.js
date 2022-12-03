import { isTouchDevice } from './touch.js'

const getScreenDimensions = () => {
    let width, height
    if (isTouchDevice()) {
        if (window.innerWidth > window.innerHeight) {
            width = window.screen.availHeight * window.devicePixelRatio
            height = window.screen.availWidth * window.devicePixelRatio
        } else {
            width = window.screen.availWidth * window.devicePixelRatio
            height = window.screen.availHeight * window.devicePixelRatio
        }
    } else {
        width = window.innerWidth * window.devicePixelRatio
        height = window.innerHeight * window.devicePixelRatio
    }
    return { width, height }
}

export {
    getScreenDimensions
}
