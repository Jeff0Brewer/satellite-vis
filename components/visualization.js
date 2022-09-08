import { useState, useRef, useEffect } from 'react'
import { mat4 } from 'gl-matrix'
import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import { incrementEpoch } from '../lib/shared-epoch.js'
import * as Satellites from './vis/satellites.js'
import * as Earth from './vis/earth.js'
import * as Skybox from './vis/skybox.js'
import Clock from './clock.js'
import useWindowDim from '../util/window-dim.js'
import styles from '../styles/Visualization.module.css'

const Visualization = props => {
    const sgp4WorkerRefs = useRef([])
    const sgp4MemoryRefs = useRef([])
    const SGP4_THREADS = 2

    const { width, height } = useWindowDim()
    const canvRef = useRef()
    const glRef = useRef()
    const satelliteRef = useRef()
    const earthRef = useRef()
    const skyboxRef = useRef()
    const visScale = .0001
    const modelMatRef = useRef(
        mat4.scale(
            mat4.create(), 
            mat4.create(), 
            [visScale, visScale, visScale])
    )
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
    const floatSize = Float32Array.BYTES_PER_ELEMENT

    const frameIdRef = useRef()
    const requestFrame = func => frameIdRef.current = window.requestAnimationFrame(func)
    const cancelFrame = () => window.cancelAnimationFrame(frameIdRef.current)

    const setupViewport = (gl, width, height) => {
        gl.viewport(0, 0, width, height)
        const projMatrix = getProjMat(width/height)
        Satellites.updateProjMatrix(gl, projMatrix, satelliteRef.current)
        Earth.updateProjMatrix(gl, projMatrix, earthRef.current)
        skyboxRef.current = Skybox.updateProjMatrix(projMatrix, skyboxRef.current)
    }

    const setupGl = async gl => {
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)

        const [satelliteVars, earthVars, skyboxVars] = await Promise.all([
            Satellites.setupGl(gl, props.data.length, visScale, viewMatrix),
            Earth.setupGl(gl, viewMatrix, props.epoch),
            Skybox.setupGl(gl, viewMatrix)
        ])
        satelliteRef.current = satelliteVars
        earthRef.current = earthVars
        skyboxRef.current = skyboxVars

        const {innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
        setupViewport(gl, w * dpr, h * dpr)
    }

    const concatTle = (tles) => {
        return tles.reduce((prev, tle) => `${prev}${tle.name}\n${tle.line1}\n${tle.line2}\n\n`, '').slice(0, -2)
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

        sgp4WorkerRefs.current.forEach(worker => worker.terminate())
        sgp4WorkerRefs.current = []
        for (let i = 0; i < SGP4_THREADS; i++) {
            sgp4WorkerRefs.current.push(new Worker(new URL('../util/sgp4-worker.js', import.meta.url)))
        }
    }, [])

    useEffect(() => {
        setupViewport(glRef.current, width, height)
    }, [width, height])

    useEffect(() => { 
        satelliteRef.current = Satellites.updateBuffer(glRef.current, props.data.length, satelliteRef.current)

        const tlePerThread = Math.floor(props.data.length/SGP4_THREADS)
        let tles = []
        sgp4MemoryRefs.current = []
        for (let i = 0; i < SGP4_THREADS; i++) {
            const numTle = i == SGP4_THREADS - 1 ? props.data.length - tlePerThread*i : tlePerThread
            sgp4MemoryRefs.current.push(
                new Float32Array(new SharedArrayBuffer(numTle * 3*4))
            )
            tles.push(concatTle(props.data.slice(i*tlePerThread, i*tlePerThread + numTle)))
        }
        sgp4WorkerRefs.current.forEach((worker, i) => {
            worker.postMessage({
                data: tles[i],
                memory: sgp4MemoryRefs.current[i],
                epoch: props.epoch
            })
        })

    }, [props.data])

    useEffect(() => {
        const gl = glRef.current
        const lastT = 0
        const posBuffer = new Float32Array(props.data.length * 3)

        const tick = currT => {
            const elapsed = currT - lastT > 100 ? 0 : currT - lastT
            lastT = currT
            incrementEpoch(props.epoch, elapsed*props.clockSpeed)

            let offset = 0
            sgp4MemoryRefs.current.forEach((buffer, i) => {
                posBuffer.set(buffer, offset)
                offset += buffer.length
            })

            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
            Skybox.draw(gl, modelMatRef.current, skyboxRef.current)
            Earth.draw(gl, props.epoch, modelMatRef.current, earthRef.current)
            Satellites.draw(gl, posBuffer, modelMatRef.current, satelliteRef.current)

            requestFrame(tick)
        }
        requestFrame(tick)
        return cancelFrame
    }, [props.clockSpeed, props.data])

    return (
        <canvas className={styles.vis} ref={canvRef} width={width} height={height}/>
    )
}

export default Visualization
