import React, { useState, useRef, useEffect } from 'react'
import { mat4 } from 'gl-matrix'
import { loadShader, createProgram, switchShader, initAttribute, initBuffer } from '../lib/glu.js'
import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import keplerianAttribs from '../models/keplerAttrib.js'
import useWindowDim from '../hooks/window-dim.js'
import styles from '../styles/SatVis.module.css'

const SatVis = props => {
    const { width, height } = useWindowDim()

    const canvRef = useRef()
    const glRef = useRef()
    const pointRef = useRef({})

    const modelMatRef = useRef(mat4.create())
    const viewMatrix = mat4.lookAt(mat4.create(), 
        [0, 2, 0], // camera position
        [0, 0, 0], // camera focus
        [0, 0, 1] // up vector
    )
    const getProjMat = (aspect) => {
        return mat4.perspective(mat4.create(),
            70, //fov
            aspect,
            .1, //near
            100 //far
        )
    }
    const byteSize = Float32Array.BYTES_PER_ELEMENT

    const initPrograms = async gl => {
        const pointVert = await loadShader(gl, gl.VERTEX_SHADER, './shaders/pointVert.glsl')
        const pointFrag = await loadShader(gl, gl.FRAGMENT_SHADER, './shaders/pointFrag.glsl')
        pointRef.current['program'] = createProgram(gl, pointVert, pointFrag)
    }

    const initShaderVars = gl => {
        switchShader(gl, pointRef.current.program)

        for(let i = 0; i < keplerianAttribs.length; i++)
            pointRef.current[keplerianAttribs[i]] = initAttribute(gl, keplerianAttribs[i], 1, keplerianAttribs.length, i, false, byteSize)
        pointRef.current['uTime'] = gl.getUniformLocation(gl.program, 'uTime')
        pointRef.current['uModelMatrix'] = gl.getUniformLocation(gl.program, 'uModelMatrix')
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uViewMatrix'), false, viewMatrix)
    }

    const initBuffers = gl => {
        pointRef.current['buffer'] = initBuffer(gl, props.data, gl.STATIC_DRAW)
    }

    const setupViewport = gl => {
        const {innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
        gl.viewport(0, 0, w * dpr, h * dpr)
        const projMatrix = getProjMat((w * dpr)/(h * dpr))
    
        if (pointRef.current?.program) {
            switchShader(gl, pointRef.current.program)
            gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
        }
    }

    const initGl = async () => {
        glRef.current = canvRef.current.getContext('webgl', { preserveDrawingBuffer: false })
        await initPrograms(glRef.current)
        initBuffers(glRef.current)
        initShaderVars(glRef.current)
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
        setupViewport(glRef.current)
    }, [width, height])

    useEffect(() => {
        if (!glRef.current || !pointRef.current.buffer) return

        const gl = glRef.current
        gl.bindBuffer(gl.ARRAY_BUFFER, pointRef.current.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, props.data, gl.STATIC_DRAW)
    }, [props.data])

    useEffect(() => {
        const gl = glRef.current
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

        if (pointRef.current?.buffer) {
            switchShader(gl, pointRef.current.program)
            gl.uniformMatrix4fv(pointRef.current.uModelMatrix, false, modelMatRef.current)
            gl.uniform1f(pointRef.current.uTime, props.epoch)

            gl.bindBuffer(gl.ARRAY_BUFFER, pointRef.current.buffer)
            for (let i = 0; i < keplerianAttribs.length; i++)
                gl.vertexAttribPointer(pointRef.current[keplerianAttribs[i]], 1, gl.FLOAT, false, keplerianAttribs.length * byteSize , i * byteSize)

            gl.drawArrays(gl.POINTS, 0, props.data.length / keplerianAttribs.length)
        }
    }, [props.epoch])

    return (
        <canvas className={styles.vis} ref={canvRef} width={width} height={height}></canvas>
    )
}

export default SatVis
