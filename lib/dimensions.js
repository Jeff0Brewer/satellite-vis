import { isTouchDevice } from './touch.js'

const getScreenDimensions = () => {
    let width, height
    if (isTouchDevice()) {
        width = window.screen.width * window.devicePixelRatio
        height = window.screen.height * window.devicePixelRatio
    } else {
        width = window.innerWidth * window.devicePixelRatio
        height = window.innerHeight * window.devicePixelRatio
    }
    return { width, height }
}

export {
    getScreenDimensions
}
