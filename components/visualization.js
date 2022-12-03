import React, { useState, useRef, useEffect } from 'react'
import { mat4, vec3 } from 'gl-matrix'
import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import { byteToHex } from '../lib/hex.js'
import { isTouchDevice } from '../lib/touch.js'
import * as Satellites from './vis/satellites.js'
import * as Earth from './vis/earth.js'
import * as Skybox from './vis/skybox.js'
import * as Glow from './vis/glow.js'
import styles from '../styles/Visualization.module.css'

// component handling sgp4 calculation threads and gl visualization
const Visualization = props => {
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [dpr, setDpr] = useState(0)

    const canvRef = useRef()
    const glRef = useRef()
    const satelliteRef = useRef()
    const earthRef = useRef()
    const skyboxRef = useRef()
    const glowRef = useRef()

    const VIS_SCALE = 0.0001
    const modelMatRef = useRef(
        mat4.fromScaling(mat4.create(),
            [VIS_SCALE, VIS_SCALE, VIS_SCALE]
        )
    )
    const minZoom = 0.8
    const maxZoom = 80
    const viewMatRef = useRef(
        mat4.lookAt(mat4.create(),
            [0, 3, 0],
            [0, 0, 0],
            [0, 0, 1]
        )
    )
    const getProjMat = aspect => {
        return mat4.perspective(mat4.create(),
            50 * Math.PI / 180,
            aspect,
            0.1,
            100
        )
    }

    const MIN_SAT_PER_THREAD = 20
    const sgp4WorkerRefs = useRef([])
    const sgp4MemoryRefs = useRef([])

    const frameIdRef = useRef()

    const cursorPosRef = useRef({ x: 0, y: 0 })

    const setupGl = async gl => {
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.getExtension('OES_standard_derivatives')

        // initialize visualization elements, store references to required variables for each element
        const [satelliteVars, earthVars, skyboxVars, glowVars] = await Promise.all([
            Satellites.setupGl(gl, props.data.length),
            Earth.setupGl(gl, props.epoch, props.lighting),
            Skybox.setupGl(gl),
            Glow.setupGl(gl)
        ])
        satelliteRef.current = satelliteVars
        earthRef.current = earthVars
        skyboxRef.current = skyboxVars
        glowRef.current = glowVars

        setupViewport(gl)
    }

    // update viewport, projection matrix, and canvas size
    const setupViewport = gl => {
        const { innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
        setWidth(w)
        setHeight(h)
        setDpr(dpr)
        gl.viewport(0, 0, w * dpr, h * dpr)

        const projMatrix = getProjMat(w / h)
        Earth.updateProjMatrix(gl, projMatrix, earthRef.current)
        satelliteRef.current = Satellites.updateProjMatrix(gl, projMatrix, satelliteRef.current)
        skyboxRef.current = Skybox.updateProjMatrix(projMatrix, skyboxRef.current)
        Glow.updateProjMatrix(gl, projMatrix, glowRef.current)
    }

    // get functions to return matrices for each camera mode
    const setupCameraMode = (followId, cameraMode) => {
        let getViewMatrix = () => viewMatRef.current
        let getModelMatrix = () => modelMatRef.current

        // rotate model matrix with earth when in fixed mode
        if (cameraMode === 'FIXED') {
            getModelMatrix = earthRotation => mat4.multiply(mat4.create(),
                modelMatRef.current,
                mat4.invert(mat4.create(), earthRotation)
            )
        }

        if (followId) {
            // find index of satellite selected to follow
            const index = props.data.map(item => item.satelliteId).indexOf(props.followId)
            if (index < 0) { return { getViewMatrix, getModelMatrix } }

            // return view matrix positioned slightly beyond followed satellite position
            const followDistance = 0.5
            getViewMatrix = posBuffer => {
                const satPosition = posBuffer.slice(index * 3, index * 3 + 3)
                const len = vec3.length(satPosition)
                if (!len) return
                const camPosition = satPosition.map(v => v * VIS_SCALE + v / len * followDistance)
                return mat4.lookAt(mat4.create(),
                    camPosition,
                    [0, 0, 0],
                    [0, 0, 1]
                )
            }

            // ignore model matrix rotation when following satellite
            const scaleMatrix = mat4.fromScaling(mat4.create(), [VIS_SCALE, VIS_SCALE, VIS_SCALE])
            getModelMatrix = () => scaleMatrix
        }
        return { getViewMatrix, getModelMatrix }
    }

    const getViewHandlersMouse = () => {
        let dragging = false
        const handlers = {}
        handlers.mousedown = () => { dragging = true }
        handlers.mouseup = () => { dragging = false }
        handlers.mousemove = e => {
            cursorPosRef.current.x = e.clientX
            cursorPosRef.current.y = e.clientY
            if (dragging) {
                modelMatRef.current = mouseRotate(modelMatRef.current, e.movementX, e.movementY, 0.004, Math.PI / 2)
            }
        }
        handlers.wheel = e => {
            viewMatRef.current = scrollZoom(viewMatRef.current, e.deltaY, -0.001, minZoom, maxZoom)
            e.preventDefault()
        }
        return handlers
    }

    const getViewHandlersTouch = () => {
        const handlers = {}
        handlers.touchstart = e => {
            if (e.touches.length === 1) {
                cursorPosRef.current.x = e.touches[0].clientX
                cursorPosRef.current.y = e.touches[0].clientY
            }
            if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                cursorPosRef.current.dist = Math.sqrt(dx * dx + dy * dy)
            }
        }
        handlers.touchend = e => {
            if (e.touches.length === 1) {
                cursorPosRef.current.x = e.touches[0].clientX
                cursorPosRef.current.y = e.touches[0].clientY
            }
        }
        const handleDrag = e => {
            const x = e.touches[0].clientX
            const y = e.touches[0].clientY
            const dx = x - cursorPosRef.current.x
            const dy = y - cursorPosRef.current.y
            cursorPosRef.current.x = x
            cursorPosRef.current.y = y
            modelMatRef.current = mouseRotate(modelMatRef.current, dx, dy, 0.004, Math.PI / 2)
        }
        const handlePinch = e => {
            const dx = e.touches[0].clientX - e.touches[1].clientX
            const dy = e.touches[0].clientY - e.touches[1].clientY
            const dist = Math.sqrt(dx * dx + dy * dy)
            const dd = dist - cursorPosRef.current.dist
            cursorPosRef.current.dist = dist
            viewMatRef.current = scrollZoom(viewMatRef.current, dd, -0.003, minZoom, maxZoom)
        }
        handlers.touchmove = e => {
            if (e.touches.length === 1) {
                handleDrag(e)
            } else if (e.touches.length === 2) {
                handlePinch(e)
            }
        }
        return handlers
    }

    // initialize gl and event handlers on component mount
    useEffect(() => {
        glRef.current = canvRef.current.getContext('webgl', { preserveDrawingBuffer: true })
        setupGl(glRef.current)

        // setup viewport on page resize
        const resizeHandler = () => setupViewport(glRef.current)
        window.addEventListener('resize', resizeHandler)
        window.addEventListener('orientationchange', resizeHandler)

        // add handlers for rotation and zooming
        const canvHandlers = isTouchDevice()
            ? getViewHandlersTouch()
            : getViewHandlersMouse()
        for (const [type, handler] of Object.entries(canvHandlers)) {
            canvRef.current.addEventListener(type, handler)
        }

        return () => {
            // remove event handlers on unmount
            window.removeEventListener('resize', resizeHandler)
            window.removeEventListener('orientationchange', resizeHandler)
            for (const [type, handler] of Object.entries(canvHandlers)) {
                canvRef.current.removeEventListener(type, handler)
            }
        }
    }, [])

    // initialize worker threads
    useEffect(() => {
        for (let i = 0; i < props.threadCount; i++) {
            sgp4WorkerRefs.current.push(new Worker(new URL('../util/sgp4-worker.js', import.meta.url)))
        }

        return () => {
            sgp4WorkerRefs.current.forEach(worker => worker.terminate())
            sgp4WorkerRefs.current = []
        }
    }, [props.threadCount])

    // update visualization elements and start sgp4 workers on data change
    useEffect(() => {
        const satrecs = props.data.map(item => item.satrec)

        satelliteRef.current = Satellites.updateBuffer(glRef.current, props.data, satelliteRef.current)
        if (satrecs.length > 0) { earthRef.current = Earth.updateRotationOffset(satrecs[0], earthRef.current) }

        // partition memory and satellite data into worker threads
        const satPerWorker = Math.max(Math.ceil(satrecs.length / props.threadCount), MIN_SAT_PER_THREAD)
        sgp4MemoryRefs.current = []
        const workerData = []
        let doneSats = 0
        while (doneSats < satrecs.length) {
            const numSats = Math.min(satPerWorker, satrecs.length - doneSats)
            sgp4MemoryRefs.current.push(new Float32Array(new SharedArrayBuffer(numSats * 3 * 4)))
            workerData.push(satrecs.slice(doneSats, doneSats + numSats))
            doneSats += numSats
        }

        // begin worker thread calculations with new data
        sgp4WorkerRefs.current.forEach((worker, i) => {
            if (i < sgp4MemoryRefs.current.length) {
                worker.postMessage({
                    task: 'start',
                    data: workerData[i],
                    memory: sgp4MemoryRefs.current[i],
                    epoch: props.epoch,
                    tickrate: props.tickrate
                })
            } else {
                worker.postMessage({
                    task: 'stop'
                })
            }
        })
    }, [props.data, props.threadCount, props.tickrate])

    // setup event handlers for mouse click satellite selection
    useEffect(() => {
        if (isTouchDevice()) { return }
        const selectHandlers = {}

        // store time of mousedown to prevent filtering on long drags
        let clickTime = 0
        selectHandlers.mousedown = () => {
            clickTime = Date.now()
        }

        // find satellite id on click and set selected id for filtering
        selectHandlers.mouseup = e => {
            const currTime = Date.now()
            if (currTime - clickTime > 300) { return }

            // get color of pixel under mouse
            const height = window.innerHeight * window.devicePixelRatio
            const clickY = (height - e.clientY)
            const clickX = e.clientX
            const clickColor = new Uint8Array(4)
            glRef.current.readPixels(clickX, clickY, 1, 1, glRef.current.RGBA, glRef.current.UNSIGNED_BYTE, clickColor)

            // lookup color in select color map to find satellite index
            const colorHex = byteToHex(clickColor.slice(0, 3))
            const ind = Satellites.selectColors.indexOf(colorHex)
            if (ind !== -1) { props.setSelectId(props.data[ind].satelliteId) }
        }
        for (const [type, handler] of Object.entries(selectHandlers)) {
            canvRef.current.addEventListener(type, handler)
        }
        return () => {
            // remove handlers on data change
            for (const [type, handler] of Object.entries(selectHandlers)) {
                canvRef.current.removeEventListener(type, handler)
            }
        }
    }, [props.data])

    // update earth lighting uniform on lighting state change
    useEffect(() => {
        Earth.updateLighting(glRef.current, props.lighting, earthRef.current)
    }, [props.lighting])

    // main draw loop
    useEffect(() => {
        const { getViewMatrix, getModelMatrix } = setupCameraMode(props.followId, props.cameraMode)
        const posBuffer = new Float32Array(props.data.length * 3)
        const gl = glRef.current

        let lastT = 0
        const tick = currT => {
            const elapsed = currT - lastT > 100 ? 0 : currT - lastT
            lastT = currT
            // update shared epoch with elapsed time
            props.epoch[0] += elapsed * props.clockSpeed

            // copy data from worker memory into position buffer
            let offset = 0
            sgp4MemoryRefs.current.forEach(buffer => {
                posBuffer.set(buffer, offset)
                offset += buffer.length
            })

            // get required matrices
            const earthRotation = Earth.getRotationMatrix(props.epoch[0], earthRef.current)
            const modelMatrix = getModelMatrix(earthRotation)
            const viewMatrix = getViewMatrix(posBuffer)

            if (!viewMatrix) {
                frameIdRef.current = window.requestAnimationFrame(tick)
                return
            }

            // draw all visualization elements
            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
            gl.disable(gl.DEPTH_TEST)
            Skybox.draw(gl, viewMatrix, modelMatrix, skyboxRef.current)
            Glow.draw(gl, viewMatrix, modelMatrix, glowRef.current)
            gl.enable(gl.DEPTH_TEST)
            Earth.draw(gl, viewMatrix, modelMatrix, earthRotation, earthRef.current)
            Satellites.draw(gl, viewMatrix, modelMatrix, posBuffer, cursorPosRef.current, satelliteRef.current)

            frameIdRef.current = window.requestAnimationFrame(tick)
        }
        frameIdRef.current = window.requestAnimationFrame(tick)

        return () => window.cancelAnimationFrame(frameIdRef.current)
    }, [props.clockSpeed, props.data, props.followId, props.cameraMode])

    return (
        <canvas
            className={styles.vis}
            ref={canvRef}
            width={width * dpr}
            height={height * dpr}
        />
    )
}

export default Visualization
