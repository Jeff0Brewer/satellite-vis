import { isTouchDevice } from './touch.js'

const getScreenDimensions = () => {
    let width, height
    if (isTouchDevice()) {
        if (window.innerWidth > window.innerHeight) {
            width = window.innerHeight * window.devicePixelRatio
            height = window.innerWidth * window.devicePixelRatio
        } else {
            width = window.innerWidth * window.devicePixelRatio
            height = window.innerHeight * window.devicePixelRatio
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
