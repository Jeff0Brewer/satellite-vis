const isTouchDevice = () => {
    return (
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0 ||
        'ontouchstart' in window
    )
}

export {
    isTouchDevice
}
