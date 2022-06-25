import React, { useRef, useEffect, useState } from 'react'
import { mat4 } from 'gl-matrix'
import { getLatLngObj } from 'tle.js'

import { loadShader, createProgram, switchShader, initAttribute, initBuffer } from '../lib/glu.js'
import useWindowDim from '../hooks/window-dim.js'
import styles from '../styles/Home.module.css'

const Home = () => {
    const { width, height } = useWindowDim()
    const [glReady, setGlReady] = useState(false)
    const canvRef = useRef(null)
    const frameIdRef = useRef(null)
    const glRef = useRef({
        gl: null,
        buffer: {},
        attrib: {},
        program: {},
        byteSize: null,
    })
    const modelMatRef = useRef(mat4.create())
    const projArg = {
        fov: 90,
        near: 0.1,
        far: 100
    }
    const viewArg = [
        [0, 0, 10], //camera position
        [0, 0, 0], //camera focus
        [0, 1, 0] //up vector
    ]

    const numPoint = 1000


    const requestFrame = func => { frameIdRef.current = window.requestAnimationFrame(func) }
    const cancelFrame = () => { window.cancelAnimationFrame(frameIdRef.current) }

    const draw = time => {
        const { gl, buffer, attrib, byteSize } = glRef.current
        if (!glReady) {
            requestFrame(draw)
            return
        }


        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.point)
        gl.vertexAttribPointer(attrib.point.aPosition, 3, gl.FLOAT, false, 3 * byteSize, 0)
        gl.drawArrays(gl.POINTS, 0, numPoint)

        requestFrame(draw)
    }

    const initGl = async () => {
        if (glRef.current.gl) return;

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

        const pointData = (new Float32Array(numPoint*3)).map(e => 2*Math.random() - 1)
        const byteSize = pointData.BYTES_PER_ELEMENT
        glRef.current.byteSize = byteSize
        glRef.current.buffer['point'] = initBuffer(gl, pointData, gl.STATIC_DRAW)

        glRef.current.attrib['point'] = {}
        glRef.current.attrib.point['aPosition'] = initAttribute(gl, 'aPosition', 3, 3, 0, false, byteSize)

        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uModelMatrix'), false, modelMatRef.current)
        const viewMatrix = mat4.lookAt(mat4.create(), ...viewArg)
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uViewMatrix'), false, viewMatrix)

        setGlReady(true)
    }

    const getData = () => {
        fetch('/api/tle/120')
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.log(err))
    }

    useEffect(() => {
        initGl() 
        getData()
    }, [])

    useEffect(() => {
        requestFrame(draw)

        return () => {
            cancelFrame()
        }
    }, [glReady])

    useEffect(() => {
        const { gl } = glRef.current
        if (!glReady)
            return
        gl.viewport(0, 0, width, height)
        const projMatrix = mat4.perspective(
            mat4.create(),
            projArg.fov,
            width/height,
            projArg.near,
            projArg.far
        )
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
    }, [width, height, glReady])

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

