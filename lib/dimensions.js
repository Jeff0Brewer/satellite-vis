import { isTouchDevice } from './touch.js'

const getScreenDimensions = () => {
    let width, height
    if (isTouchDevice()) {
        width = window.screen.availWidth
        height = window.screen.availHeight
    } else {
        width = window.innerWidth * window.devicePixelRatio
        height = window.innerHeight * window.devicePixelRatio
    }
    return { width, height }
}

export {
    getScreenDimensions
}
