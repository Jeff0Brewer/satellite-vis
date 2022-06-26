import React, { useState, useRef, useEffect } from 'react'
import { mat4 } from 'gl-matrix'
import useWindowDim from '../hooks/window-dim.js'
import { loadShader, createProgram, switchShader, initAttribute, initBuffer } from '../lib/glu.js'
import styles from '../styles/SatVis.module.css'

const SatVis = props => {
    const { width, height } = useWindowDim()
    const canvRef = useRef()

    const glRef = useRef()
    const programRef = useRef({})
    const bufferRef = useRef({})
    const locationRef = useRef({})

    const modelMatRef = useRef(mat4.create())
    const viewMatrix = mat4.lookAt(mat4.create(), 
        [0, 0, 5], // camera position
        [0, 0, 0], // camera focus
        [0, 1, 0] // up vector
    )
    const getProjMat = (aspect) => {
        return mat4.perspective(mat4.create(),
            90, //fov
            aspect,
            .1, //near
            100 //far
        )
    }
    
    const byteSize = Float32Array.BYTES_PER_ELEMENT

    const frameIdRef = useRef()
    const requestFrame = func => { frameIdRef.current = window.requestAnimationFrame(func) }
    const cancelFrame = () => { if(frameIdRef.current) window.cancelAnimationFrame(frameIdRef.current) }

    const initPrograms = async (gl) => {
        const pointVert = await loadShader(gl, gl.VERTEX_SHADER, './shaders/pointVert.glsl')
        const pointFrag = await loadShader(gl, gl.FRAGMENT_SHADER, './shaders/pointFrag.glsl')
        programRef.current['point'] = createProgram(gl, pointVert, pointFrag)
    }

    const initShaderVars = (gl, programs) => {
        switchShader(gl, programs.point)

        locationRef.current['point'] = {}
        locationRef.current.point['aPosition'] = initAttribute(gl, 'aPosition', 3, 3, 0, false, byteSize)
        
        const uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix')
        locationRef.current.point['uModelMatrix'] = uModelMatrix
        gl.uniformMatrix4fv(uModelMatrix, false, modelMatRef.current)
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uViewMatrix'), false, viewMatrix)
    }

    const initBuffers = (gl) => {
        bufferRef.current['point'] = initBuffer(gl, props.data, gl.STATIC_DRAW)
    }

    const setupViewport = (gl, programs) => {
        const {innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
        gl.viewport(0, 0, w * dpr, h * dpr)
        const projMatrix = getProjMat((w * dpr)/(h * dpr))
    
        if(programs?.point) {
            switchShader(gl, programs.point)
            gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
        }
    }

    const initGl = async () => {
        glRef.current = canvRef.current.getContext('webgl', { preserveDrawingBuffer: false })

        await initPrograms(glRef.current)
        initShaderVars(glRef.current, programRef.current)
        initBuffers(glRef.current)
        setupViewport(glRef.current, programRef.current)

        requestFrame(draw)
    }

    const draw = time => {
        const gl = glRef.current

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

        modelMatRef.current = mat4.fromRotation(mat4.create(), time/1000, [0, 1, 0])

        if (bufferRef.current?.point) {
            switchShader(gl, programRef.current.point)
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferRef.current.point)
            gl.vertexAttribPointer(locationRef.current.point.aPosition, 3, gl.FLOAT, false, 3 * byteSize, 0)
            gl.uniformMatrix4fv(locationRef.current.point.uModelMatrix, false, modelMatRef.current)
            gl.drawArrays(gl.POINTS, 0, props.data.length / 3)
        }

        requestFrame(draw)
    }

    useEffect(() => {
        initGl()
        return cancelFrame
    }, [])

    useEffect(() => {
        setupViewport(glRef.current, programRef.current)
    }, [width, height])

    return (
        <canvas className={styles.vis} ref={canvRef} width={width} height={height}></canvas>
    )
}

export default SatVis
