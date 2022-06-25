import React, { useRef, useEffect } from 'react'
import { getLatLngObj } from 'tle.js'
import { loadShader, createProgram, switchShader, initAttribute, initBuffer } from '../lib/glu.js'
import useWindowDim from '../hooks/window-dim.js'
import styles from '../styles/Home.module.css'

const Home = () => {
    const { width, height } = useWindowDim()
    const canvRef = useRef(null)
    const frameIdRef = useRef(null)
    const glRef = useRef({
        gl: null,
        buffer: {},
        attrib: {},
        program: {},
        byteSize: null,
        ready: false
    })

    const requestFrame = func => { frameIdRef.current = window.requestAnimationFrame(func) }
    const cancelFrame = () => { window.cancelAnimationFrame(frameIdRef.current) }

    const draw = time => {
        const { gl, buffer, attrib, byteSize, ready } = glRef.current
        if (!ready) {
            requestFrame(draw)
            return
        }

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.point)
        gl.vertexAttribPointer(attrib.point.aPosition, 3, gl.FLOAT, false, 3 * byteSize, 0)
        gl.drawArrays(gl.POINTS, 0, 1)

        requestFrame(draw)
    }

    const initGl = async () => {
        const gl = canvRef.current.getContext('webgl', { preserveDrawingBuffer: false })
        glRef.current.gl = gl

        const { innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
        gl.viewport(0, 0, w * dpr, h * dpr)

        const pointVert = await fetch('./shaders/pointVert.glsl')
            .then(res => res.text())
            .then(source => loadShader(gl, gl.VERTEX_SHADER, source))
            .catch(err => console.log(err))

        const pointFrag = await fetch('./shaders/pointFrag.glsl')
            .then(res => res.text())
            .then(source => loadShader(gl, gl.FRAGMENT_SHADER, source))
            .catch(err => console.log(err))
        
        const pointProgram = createProgram(gl, pointVert, pointFrag)
        switchShader(gl, pointProgram)
        glRef.current.program['point'] = pointProgram

        const pointData = new Float32Array([0.0, 0.0, 0.0])
        const byteSize = pointData.BYTES_PER_ELEMENT
        glRef.current.byteSize = byteSize
        glRef.current.buffer['point'] = initBuffer(gl, pointData, gl.STATIC_DRAW)

        glRef.current.attrib['point'] = {}
        glRef.current.attrib.point['aPosition'] = initAttribute(gl, 'aPosition', 3, 3, 0, false, byteSize)

        glRef.current.ready = true
    }

    useEffect(() => {
        initGl()
        requestFrame(draw)

        return () => {
            cancelFrame()
        }
    }, [])

    useEffect(() => {
        const { gl, ready } = glRef.current
        if (!ready)
            return
        gl.viewport(0, 0, width, height)
    }, [width, height])

    return (
        <main className={styles.home}>
            <canvas className={styles.vis} ref={canvRef} width={width} height={height}></canvas>
        </main>
    )
}

export default Home

















//    const getData = () => {
//        fetch('/api/tle/120')
//            .then(res => res.json())
//            .then(data => {
//                console.log(data)
//                const example = data.member[0]
//                console.log(getLatLngObj(example.tle, example.timestamp))
//            })
//            .catch(err => console.log(err))
//    }
//
//    useEffect(() => {
//        getData()
//    }, [])

