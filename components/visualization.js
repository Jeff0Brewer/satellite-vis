import { useState, useRef, useEffect } from 'react'
import { mat4, vec3 } from 'gl-matrix'
import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
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
    const frameIdRef = useRef()
    const requestFrame = func => frameIdRef.current = window.requestAnimationFrame(func)
    const cancelFrame = () => window.cancelAnimationFrame(frameIdRef.current)
    const MAX_SGP4_THREAD = 100
    const MIN_PER_THREAD = 20
    const sgp4WorkerRefs = useRef([])
    const sgp4MemoryRefs = useRef([])

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
        const {innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
        gl.viewport(0, 0, w*dpr, h*dpr)
        setWidth(w*dpr)
        setHeight(h*dpr)

        const projMatrix = getProjMat(w/h)
        Satellites.updateProjMatrix(gl, projMatrix, satelliteRef.current)
        Earth.updateProjMatrix(gl, projMatrix, earthRef.current)
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

            const viewDistance = .5
            getViewMatrix = posBuffer => {
                const satPosition = posBuffer.slice(index*3, index*3 + 3)
                const len = vec3.length(satPosition)
                if (!len) 
                    return

                const camPosition = satPosition.map(v => v*VIS_SCALE + v/len*viewDistance)
                return mat4.lookAt(mat4.create(),
                    camPosition,
                    [0, 0, 0],
                    [0, 0, 1]
                )
            }
            const scaleMatrix = mat4.fromScaling(mat4.create(), [VIS_SCALE, VIS_SCALE, VIS_SCALE])
            getModelMatrix = () => scaleMatrix
            return { getViewMatrix, getModelMatrix }
        }
        return { getViewMatrix, getModelMatrix }
    }

    useEffect(() => {
        glRef.current = canvRef.current.getContext('webgl', { preserveDrawingBuffer: false })
        setupGl(glRef.current)

        if (!sgp4WorkerRefs.current?.length) {
            for (let i = 0; i < MAX_SGP4_THREAD; i++) {
                sgp4WorkerRefs.current.push(new Worker(new URL('../util/sgp4-worker.js', import.meta.url)))
            }
        }

        const dragHandler = e => modelMatRef.current = mouseRotate(modelMatRef.current, e.movementX, e.movementY, .002)
        canvRef.current.addEventListener('mousedown', () => canvRef.current.addEventListener('mousemove', dragHandler))
        canvRef.current.addEventListener('mouseup', () => canvRef.current.removeEventListener('mousemove', dragHandler))
        canvRef.current.addEventListener('wheel', e => { 
            e.preventDefault()
            viewMatRef.current = scrollZoom(viewMatRef.current, e.deltaY, -0.0005, .8, 80)
        })
        window.addEventListener('resize', () => setupViewport(glRef.current))
    }, [])

    useEffect(() => {
        Earth.updateLighting(glRef.current, props.lighting, earthRef.current)
    }, [props.lighting])

    useEffect(() => { 
        const satrecs = props.data.map(item => item.satrec)

        satelliteRef.current = Satellites.updateBuffer(glRef.current, props.data, satelliteRef.current)
        if (props.data.length > 0) {
            earthRef.current = Earth.updateRotationOffset(satrecs[0], earthRef.current)
        }

        const workerData = []
        sgp4MemoryRefs.current = []
        const satPerWorker = Math.max(Math.ceil(satrecs.length/MAX_SGP4_THREAD), MIN_PER_THREAD)
        let doneSats = 0
        let threadCount = 0
        while (doneSats < satrecs.length) {
            const numSats = Math.min(satPerWorker, satrecs.length - doneSats)
            sgp4MemoryRefs.current.push(new Float32Array(new SharedArrayBuffer(numSats*3*4)))
            workerData.push(satrecs.slice(doneSats, doneSats + numSats))
            doneSats += numSats
            threadCount++
        }

        sgp4WorkerRefs.current.forEach((worker, i) => {
            if (i < threadCount) {
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
        const gl = glRef.current
        const lastT = 0
        const posBuffer = new Float32Array(props.data.length * 3)
        const { getViewMatrix, getModelMatrix } = setupCameraMode(props.followId, props.cameraMode)

        const tick = currT => {
            const elapsed = currT - lastT > 100 ? 0 : currT - lastT
            lastT = currT
            props.epoch[0] += elapsed*props.clockSpeed

            let offset = 0
            sgp4MemoryRefs.current.forEach((buffer, i) => {
                posBuffer.set(buffer, offset)
                offset += buffer.length
            })

            const earthRotation = Earth.getRotationMatrix(props.epoch, earthRef.current)
            const modelMatrix = getModelMatrix(earthRotation)
            const viewMatrix = getViewMatrix(posBuffer)
            if (!viewMatrix) {
                requestFrame(tick)
                return
            }

            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
            Skybox.draw(gl, viewMatrix, modelMatrix, skyboxRef.current)
            Earth.draw(gl, viewMatrix, modelMatrix, earthRotation, earthRef.current)
            Satellites.draw(gl, viewMatrix, modelMatrix, posBuffer, satelliteRef.current)

            requestFrame(tick)
        }
        requestFrame(tick)
        return cancelFrame
    }, [props.clockSpeed, props.data, props.followId, props.cameraMode])

    return (
        <canvas className={styles.vis} ref={canvRef} width={width} height={height}/>
    )
}

export default Visualization
