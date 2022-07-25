import React, { useRef, useEffect } from 'react'
import { mat4 } from 'gl-matrix'
import useWindowDim from '../util/window-dim.js'
import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import { incrementEpoch } from '../lib/epoch.js'
import * as Satellites from './vis/satellites.js'
import * as Earth from './vis/earth.js'
import styles from '../styles/Visualization.module.css'

const Visualization = props => {
    const { width, height } = useWindowDim()
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
        epochRef.current = props.startEpoch
    }, [props.startEpoch])

    useEffect(() => {
        setupViewport(glRef.current, width, height)
    }, [width, height])

    useEffect(() => { 
        const numVertex = Satellites.updateBuffer(glRef.current, satelliteRef.current?.buffer, props.data)
        if (numVertex) 
            satelliteRef.current.numVertex = numVertex
    }, [props.data])
    
    useEffect(() => {
        if (!props.startEpoch) return
        const epoch = epochRef.current
        const gl = glRef.current

        let lastT = 0
        const tick = currT => {
            const elapsed = currT - lastT < 100 ? currT - lastT : 0
            lastT = currT
            epoch = incrementEpoch(epoch, elapsed*props.clockSpeed)

            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
            Satellites.draw(gl, epoch, modelMatRef.current, satelliteRef.current)
            Earth.draw(gl, epoch, modelMatRef.current, earthRef.current)

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

export default Visualization
