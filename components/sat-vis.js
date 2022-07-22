import React, { useRef, useEffect } from 'react'
import * as Satellites from './vis/satellites.js'
import * as Earth from './vis/earth.js'
import { mat4 } from 'gl-matrix'
import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import { incrementEpoch } from '../lib/epoch.js'
import useWindowDim from '../hooks/window-dim.js'
import styles from '../styles/SatVis.module.css'

const SatVis = props => {
    const canvRef = useRef()
    const glRef = useRef()
    const epochRef = useRef()
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

    const { width, height } = useWindowDim()
    const byteSize = Float32Array.BYTES_PER_ELEMENT
    const visScale = .0000001

    const setupViewport = gl => {
        const {innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
        gl.viewport(0, 0, w * dpr, h * dpr)
        const projMatrix = getProjMat((w * dpr)/(h * dpr))
        if (satelliteRef.current?.program)
            Satellites.updateProjMatrix(gl, satelliteRef.current.program, projMatrix)
        if (earthRef.current?.program)
            Earth.updateProjMatrix(gl, earthRef.current.program, projMatrix)
    }

    const initGl = async () => {
        glRef.current = canvRef.current.getContext('webgl', { preserveDrawingBuffer: false })
        glRef.current.enable(glRef.current.DEPTH_TEST)
        glRef.current.enable(glRef.current.CULL_FACE)

        const [satelliteVars, earthVars] = await Promise.all([
            Satellites.setupGl(glRef.current, props.data, visScale, viewMatrix),
            Earth.setupGl(glRef.current, visScale, viewMatrix)
        ])
        satelliteRef.current = satelliteVars
        earthRef.current = earthVars

        setupViewport(glRef.current)
    }

    useEffect(() => {
        initGl()
        const dragHandler = e => modelMatRef.current = mouseRotate(modelMatRef.current, e.movementX, e.movementY, .002)
        canvRef.current.addEventListener('mousedown', () => canvRef.current.addEventListener('mousemove', dragHandler))
        canvRef.current.addEventListener('mouseup', () => canvRef.current.removeEventListener('mousemove', dragHandler))
        canvRef.current.addEventListener('wheel', e => { 
            e.preventDefault()
            modelMatRef.current = scrollZoom(modelMatRef.current, e.deltaY, .0003)
        })
    }, [])

    useEffect(() => {
        epochRef.current = props.startEpoch
    }, [props.startEpoch])

    useEffect(() => {
        setupViewport(glRef.current)
    }, [width, height])

    useEffect(() => { 
        if (satelliteRef.current?.buffer) 
            satelliteRef.current.numVertex = Satellites.updateBuffer(glRef.current, satelliteRef.current.buffer, props.data)
    }, [props.data])
    
    useEffect(() => {
        if (!epochRef.current) return

        const epoch = epochRef.current
        const gl = glRef.current

        let lastT = 0
        const tick = currT => {
            const elapsed = currT - lastT
            if (lastT != 0) epoch = incrementEpoch(epoch, elapsed*props.clockSpeed)
            lastT = currT

            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
            if (satelliteRef.current?.program) {
                const { program, buffer, locations, numVertex } = satelliteRef.current
                Satellites.draw(gl, epoch, modelMatRef.current, program, buffer, locations, numVertex)
            }
            if(earthRef.current?.program) {
                const timeDelta = (epoch.year*365*86400) % 86400 + epoch.day*86400 + epoch.second
                const { program, buffer, locations, numVertex } = earthRef.current
                Earth.draw(gl, timeDelta, modelMatRef.current, program, buffer, locations, numVertex)
            }
            requestFrame(tick)
        }
        requestFrame(tick)

        return () => {
            cancelFrame()
            epochRef.current = epoch
        }
    }, [props.startEpoch, props.clockSpeed, props.data])

    return (
        <canvas className={styles.vis} ref={canvRef} width={width} height={height}></canvas>
    )
}

export default SatVis
