import { useState, useEffect } from 'react'

const useWindowDim = () => {
    const [windowDim, setWindowDim] = useState({
        width: null,
        height: null
    })

    useEffect(() => {
        const handleResize = () => {
            setWindowDim({
                width: window.innerWidth * window.devicePixelRatio,
                height: window.innerHeight * window.devicePixelRatio
            })
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return windowDim
}

export default useWindowDim
