import { useState, useRef, useEffect } from 'react'
import { mat4, vec3 } from 'gl-matrix'
import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import * as Satellites from './vis/satellites.js'
import * as Earth from './vis/earth.js'
import * as Skybox from './vis/skybox.js'
import Clock from './clock.js'
import useWindowDim from '../util/window-dim.js'
import styles from '../styles/Visualization.module.css'

const Visualization = props => {
    const { width, height } = useWindowDim()
    const canvRef = useRef()
    const glRef = useRef()
    const satelliteRef = useRef()
    const earthRef = useRef()
    const skyboxRef = useRef()
    const scale = .0001
    const modelMatRef = useRef(
        mat4.fromScaling(mat4.create(),
            [scale, scale, scale]
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
            50 * Math.PI/180, //fov
            aspect,
            .1, //near
            100 //far
        )
    }
    const floatSize = Float32Array.BYTES_PER_ELEMENT

    const sgp4WorkerRefs = useRef([])
    const sgp4MemoryRefs = useRef([])
    const SGP4_THREADS = 100

    const frameIdRef = useRef()
    const requestFrame = func => frameIdRef.current = window.requestAnimationFrame(func)
    const cancelFrame = () => window.cancelAnimationFrame(frameIdRef.current)

    const setupGl = async gl => {
        const [satelliteVars, earthVars, skyboxVars] = await Promise.all([
            Satellites.setupGl(gl, props.data.length),
            Earth.setupGl(gl, props.epoch),
            Skybox.setupGl(gl)
        ])
        satelliteRef.current = satelliteVars
        earthRef.current = earthVars
        skyboxRef.current = skyboxVars

        const {innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
        setupViewport(gl, w * dpr, h * dpr)

        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)
    }

    const setupViewport = (gl, width, height) => {
        gl.viewport(0, 0, width, height)
        const projMatrix = getProjMat(width/height)

        Satellites.updateProjMatrix(gl, projMatrix, satelliteRef.current)
        Earth.updateProjMatrix(gl, projMatrix, earthRef.current)
        skyboxRef.current = Skybox.updateProjMatrix(projMatrix, skyboxRef.current)
    }

    const setupCameraMode = (followId, cameraMode) => {
        let getViewMatrix, getModelMatrix
        if (followId) {
            const scaleMatrix = mat4.fromScaling(mat4.create(), [scale, scale, scale])
            getModelMatrix = () => scaleMatrix

            const index = props.data.map(item => item.satelliteId).indexOf(props.followId)
            const viewDistance = .5
            getViewMatrix = posBuffer => {
                const satPosition = posBuffer.slice(index*3, index*3 + 3)
                const invLen = 1/vec3.length(satPosition)
                const camPosition = satPosition.map(v => v*scale + v*invLen*viewDistance)
                return mat4.lookAt(mat4.create(),
                    camPosition,
                    [0, 0, 0],
                    [0, 0, 1]
                )
            }
            return { getViewMatrix, getModelMatrix }
        }

        getViewMatrix = () => viewMatRef.current
        if (cameraMode === 'FIXED') {
            getModelMatrix = earthRotation => mat4.multiply(mat4.create(),
                modelMatRef.current,
                mat4.invert(mat4.create(), earthRotation)
            )
        }
        else {
            getModelMatrix = () => modelMatRef.current
        }
        return { getViewMatrix, getModelMatrix }
    }

    useEffect(() => {
        glRef.current = canvRef.current.getContext('webgl', { preserveDrawingBuffer: false })
        setupGl(glRef.current)

        sgp4WorkerRefs.current.forEach(worker => worker.terminate())
        sgp4WorkerRefs.current = []
        for (let i = 0; i < SGP4_THREADS; i++) {
            sgp4WorkerRefs.current.push(new Worker(new URL('../util/sgp4-worker.js', import.meta.url)))
        }

        const dragHandler = e => modelMatRef.current = mouseRotate(modelMatRef.current, e.movementX, e.movementY, .002)
        canvRef.current.addEventListener('mousedown', () => canvRef.current.addEventListener('mousemove', dragHandler))
        canvRef.current.addEventListener('mouseup', () => canvRef.current.removeEventListener('mousemove', dragHandler))
        canvRef.current.addEventListener('wheel', e => { 
            e.preventDefault()
            viewMatRef.current = scrollZoom(viewMatRef.current, e.deltaY, -0.0003)
        })
    }, [])

    useEffect(() => {
        setupViewport(glRef.current, width, height)
    }, [width, height])

    useEffect(() => { 
        satelliteRef.current = Satellites.updateBuffer(glRef.current, props.data.length, satelliteRef.current)

        const satrecs = props.data.map(item => item.satrec)
        const satPerWorker = Math.floor(props.data.length/SGP4_THREADS)
        const satPerFinal = satrecs.length - satPerWorker*(SGP4_THREADS - 1)

        const workerData = []
        sgp4MemoryRefs.current = []
        for (let i = 0; i < SGP4_THREADS; i++) {
            const numSat = i === SGP4_THREADS - 1 ? satPerFinal : satPerWorker
            sgp4MemoryRefs.current.push(new Float32Array(new SharedArrayBuffer(numSat * 3*4)))
            workerData.push(satrecs.slice(i*satPerWorker, i*satPerWorker + numSat))
        }
        sgp4WorkerRefs.current.forEach((worker, i) => {
            worker.postMessage({
                data: workerData[i],
                memory: sgp4MemoryRefs.current[i],
                epoch: props.epoch
            })
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
