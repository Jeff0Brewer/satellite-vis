import { useState, useRef, useEffect } from 'react'
import { mat4, vec3 } from 'gl-matrix'
import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import { byteToHex } from '../lib/hex.js'
import * as Satellites from './vis/satellites.js'
import * as Earth from './vis/earth.js'
import * as Skybox from './vis/skybox.js'
import styles from '../styles/Visualization.module.css'

const Visualization = props => {
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const canvRef = useRef()
    const glRef = useRef()
    const satelliteRef = useRef()
    const earthRef = useRef()
    const skyboxRef = useRef()
    const VIS_SCALE = .0001
    const modelMatRef = useRef(
        mat4.fromScaling(mat4.create(),
            [VIS_SCALE, VIS_SCALE, VIS_SCALE]
        )
    )
    const viewMatRef = useRef(
        mat4.lookAt(mat4.create(),
            [0, 3, 0],
            [0, 0, 0],
            [0, 0, 1]
        )
    )
    const getProjMat = aspect => {
        return mat4.perspective(mat4.create(),
            50 * Math.PI/180,
            aspect,
            .1,
            100
        )
    }
    const MAX_SGP4_THREAD = 100
    const MIN_PER_THREAD = 20
    const sgp4WorkerRefs = useRef([])
    const sgp4MemoryRefs = useRef([])
    const mousePosRef = useRef({'x': 0, 'y': 0})
    const frameIdRef = useRef()

    const setupGl = async gl => {
        const [satelliteVars, earthVars, skyboxVars] = await Promise.all([
            Satellites.setupGl(gl, props.data.length),
            Earth.setupGl(gl, props.epoch, props.lighting),
            Skybox.setupGl(gl)
        ])
        satelliteRef.current = satelliteVars
        earthRef.current = earthVars
        skyboxRef.current = skyboxVars

        setupViewport(gl)

        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)
    }

    const setupViewport = gl => {
        const w = innerWidth*devicePixelRatio
        const h = innerHeight*devicePixelRatio
        setWidth(w)
        setHeight(h)
        gl.viewport(0, 0, w, h)

        const projMatrix = getProjMat(w/h)
        Earth.updateProjMatrix(gl, projMatrix, earthRef.current)
        satelliteRef.current = Satellites.updateProjMatrix(gl, projMatrix, satelliteRef.current)
        skyboxRef.current = Skybox.updateProjMatrix(projMatrix, skyboxRef.current)
    }

    const setupCameraMode = (followId, cameraMode) => {
        let getViewMatrix = () => viewMatRef.current
        let getModelMatrix = () => modelMatRef.current

        if (cameraMode === 'FIXED') {
            getModelMatrix = earthRotation => mat4.multiply(mat4.create(),
                modelMatRef.current,
                mat4.invert(mat4.create(), earthRotation)
            )
        }

        if (followId) {
            const index = props.data.map(item => item.satelliteId).indexOf(props.followId)
            if (index < 0)
                return { getViewMatrix, getModelMatrix }

            const followDistance = .5
            getViewMatrix = posBuffer => {
                const satPosition = posBuffer.slice(index*3, index*3 + 3)
                const len = vec3.length(satPosition)
                if (!len) return
                const camPosition = satPosition.map(v => v*VIS_SCALE + v/len*followDistance)
                return mat4.lookAt(mat4.create(),
                    camPosition,
                    [0, 0, 0],
                    [0, 0, 1]
                )
            }
            const scaleMatrix = mat4.fromScaling(mat4.create(), [VIS_SCALE, VIS_SCALE, VIS_SCALE])
            getModelMatrix = () => scaleMatrix
        }
        return { getViewMatrix, getModelMatrix }
    }

    useEffect(() => {
        glRef.current = canvRef.current.getContext('webgl', { preserveDrawingBuffer: true })
        setupGl(glRef.current)

        for (let i = 0; i < MAX_SGP4_THREAD; i++) {
            sgp4WorkerRefs.current.push(new Worker(new URL('../util/sgp4-worker.js', import.meta.url)))
        }

        const resizeHandler = () => setupViewport(glRef.current)
        window.addEventListener('resize', resizeHandler)

        const dragHandler = e => modelMatRef.current = mouseRotate(modelMatRef.current, e.movementX, e.movementY, .002)
        const canvHandlers = {}
        canvHandlers['mousedown'] = () => canvRef.current.addEventListener('mousemove', dragHandler)
        canvHandlers['mouseup'] = () => canvRef.current.removeEventListener('mousemove', dragHandler)
        canvHandlers['wheel'] = e => { 
            viewMatRef.current = scrollZoom(viewMatRef.current, e.deltaY, -0.0005, .8, 80)
            e.preventDefault()
        }
        canvHandlers['mousemove'] = e => {
            mousePosRef.current.x = e.clientX
            mousePosRef.current.y = e.clientY
        }
        for (const [type, handler] of Object.entries(canvHandlers)) {
            canvRef.current.addEventListener(type, handler)
        }

        return () => {
            sgp4WorkerRefs.current = []

            window.removeEventListener('resize', resizeHandler)
            canvRef.current.removeEventListener('mousemove', dragHandler)
            for (const [type, handler] of Object.entries(canvHandlers)) {
                canvRef.current.removeEventListener(type, handler)
            }
        }
    }, [])

    useEffect(() => { 
        const satrecs = props.data.map(item => item.satrec)

        satelliteRef.current = Satellites.updateBuffer(glRef.current, props.data, satelliteRef.current)
        if (satrecs.length > 0)
            earthRef.current = Earth.updateRotationOffset(satrecs[0], earthRef.current)

        const satPerWorker = Math.max(Math.ceil(satrecs.length/MAX_SGP4_THREAD), MIN_PER_THREAD)
        sgp4MemoryRefs.current = []
        const workerData = []
        let doneSats = 0
        while (doneSats < satrecs.length) {
            const numSats = Math.min(satPerWorker, satrecs.length - doneSats)
            sgp4MemoryRefs.current.push(new Float32Array(new SharedArrayBuffer(numSats*3*4)))
            workerData.push(satrecs.slice(doneSats, doneSats + numSats))
            doneSats += numSats
        }

        sgp4WorkerRefs.current.forEach((worker, i) => {
            if (i < sgp4MemoryRefs.current.length) {
                worker.postMessage({
                    task: 'start',
                    data: workerData[i],
                    memory: sgp4MemoryRefs.current[i],
                    epoch: props.epoch
                })
            }
            else {
                worker.postMessage({
                    task: 'stop'
                })
            }
        })
    }, [props.data])

    useEffect(() => {
        const selectHandlers = {}
        let clickTime = 0
        selectHandlers['mousedown'] = () => clickTime = Date.now()
        selectHandlers['mouseup'] = e => {
            const currTime = Date.now()
            if (currTime - clickTime > 300) return

            const clickX = e.clientX*devicePixelRatio
            const clickY = (innerHeight - e.clientY)*devicePixelRatio
            const clickColor = new Uint8Array(4)
            glRef.current.readPixels(clickX, clickY, 1, 1, glRef.current.RGBA, glRef.current.UNSIGNED_BYTE, clickColor)

            const colorHex = byteToHex(clickColor.slice(0, 3))
            const ind = Satellites.selectColors.indexOf(colorHex)
            if (ind !== -1)
                props.setSelectId(props.data[ind].satelliteId)
        }
        for (const [type, handler] of Object.entries(selectHandlers)){
            canvRef.current.addEventListener(type, handler)
        }
        return () => {
            for (const [type, handler] of Object.entries(selectHandlers)){
                canvRef.current.removeEventListener(type, handler)
            }
        }
    }, [props.data])

    useEffect(() => {
        Earth.updateLighting(glRef.current, props.lighting, earthRef.current)
    }, [props.lighting])

    useEffect(() => {
        const { getViewMatrix, getModelMatrix } = setupCameraMode(props.followId, props.cameraMode)
        const posBuffer = new Float32Array(props.data.length * 3)
        const gl = glRef.current

        const lastT = 0
        const tick = currT => {
            const elapsed = currT - lastT > 100 ? 0 : currT - lastT
            lastT = currT
            props.epoch[0] += elapsed*props.clockSpeed

            let offset = 0
            sgp4MemoryRefs.current.forEach(buffer => {
                posBuffer.set(buffer, offset)
                offset += buffer.length
            })

            const earthRotation = Earth.getRotationMatrix(props.epoch[0], earthRef.current)
            const modelMatrix = getModelMatrix(earthRotation)
            const viewMatrix = getViewMatrix(posBuffer)

            if (!viewMatrix) {
                frameIdRef.current = window.requestAnimationFrame(tick)
                return
            }

            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
            Skybox.draw(gl, viewMatrix, modelMatrix, skyboxRef.current)
            Earth.draw(gl, viewMatrix, modelMatrix, earthRotation, earthRef.current)
            Satellites.draw(gl, viewMatrix, modelMatrix, posBuffer, mousePosRef.current, satelliteRef.current)

            frameIdRef.current = window.requestAnimationFrame(tick)
        }
        frameIdRef.current = window.requestAnimationFrame(tick)

        return () => window.cancelAnimationFrame(frameIdRef.current)
    }, [props.clockSpeed, props.data, props.followId, props.cameraMode])

    return (
        <canvas className={styles.vis} ref={canvRef} width={width} height={height}/>
    )
}

export default Visualization
