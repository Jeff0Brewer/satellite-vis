import { useState, useRef, useEffect } from 'react'
import { mat4 } from 'gl-matrix'
import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import * as Satellites from './vis/satellites.js'
import * as Earth from './vis/earth.js'
import useWindowDim from '../util/window-dim.js'
import styles from '../styles/Visualization.module.css'

const Visualization = props => {
    const defaultSpeed = 100
    const [clockSpeed, setClockSpeed] = useState(defaultSpeed)
    const epochRef = useRef(new Date())

    const { width, height } = useWindowDim()
    const canvRef = useRef()
    const glRef = useRef()

    const satelliteRef = useRef()
    const earthRef = useRef()

    const modelMatRef = useRef(mat4.create())
    const viewMatrix = mat4.lookAt(mat4.create(), 
        [0, 2, 0], // camera position
        [0, 0, 0], // camera focus
        [0, 0, 1] // up vector
    )
    const getProjMat = aspect => {
        return mat4.perspective(mat4.create(),
            70, //fov
            aspect,
            .1, //near
            100 //far
        )
    }

    const frameIdRef = useRef()
    const requestFrame = func => frameIdRef.current = window.requestAnimationFrame(func)
    const cancelFrame = () => window.cancelAnimationFrame(frameIdRef.current)

    const byteSize = Float32Array.BYTES_PER_ELEMENT
    const visScale = .0000001

    const setupViewport = (gl, width, height) => {
        gl.viewport(0, 0, width, height)
        const projMatrix = getProjMat(width/height)
        Satellites.updateProjMatrix(gl, satelliteRef.current?.program, projMatrix)
        Earth.updateProjMatrix(gl, earthRef.current?.program, projMatrix)
    }

    const setupGl = async gl => {
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)

        const [satelliteVars, earthVars] = await Promise.all([
            Satellites.setupGl(gl, props.data, visScale, viewMatrix),
            Earth.setupGl(gl, visScale, viewMatrix)
        ])
        satelliteRef.current = satelliteVars
        earthRef.current = earthVars

        const {innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
        setupViewport(gl, w * dpr, h * dpr)
    }

    useEffect(() => {
        glRef.current = canvRef.current.getContext('webgl', { preserveDrawingBuffer: false })
        setupGl(glRef.current)

        const dragHandler = e => modelMatRef.current = mouseRotate(modelMatRef.current, e.movementX, e.movementY, .002)
        canvRef.current.addEventListener('mousedown', () => canvRef.current.addEventListener('mousemove', dragHandler))
        canvRef.current.addEventListener('mouseup', () => canvRef.current.removeEventListener('mousemove', dragHandler))

        canvRef.current.addEventListener('wheel', e => { 
            e.preventDefault()
            modelMatRef.current = scrollZoom(modelMatRef.current, e.deltaY, .0003)
        })
    }, [])

    useEffect(() => {
        setupViewport(glRef.current, width, height)
    }, [width, height])

    useEffect(() => { 
        //console.log(props.data)
    }, [props.data])
    
    useEffect(() => {
        const gl = glRef.current
        const lastT = 0
        const tick = currT => {
            const elapsed = currT - lastT > 100 ? 0 : currT - lastT
            lastT = currT
            epochRef.current = new Date(epochRef.current.getTime() + elapsed*clockSpeed)
            
            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
            //Satellites.draw(gl, epochRef.current, modelMatRef.current, satelliteRef.current)
            Earth.draw(gl, epochRef.current, modelMatRef.current, earthRef.current)

            requestFrame(tick)
        }
        requestFrame(tick)
        return cancelFrame
    }, [clockSpeed, props.data])

    const speedInputChange = e => {
        const val = parseFloat(e.target.value)
        if (!isNaN(val))
            setClockSpeed(val)
    }

    return (
        <section>
            <canvas className={styles.vis} ref={canvRef} width={width} height={height}></canvas>
            <input className={styles.speed} type='text' defaultValue={defaultSpeed} onChange={speedInputChange} />
        </section>
    )
}

export default Visualization
