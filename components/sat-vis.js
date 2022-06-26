import React, { useState, useRef, useEffect } from 'react'
import { mat4 } from 'gl-matrix'
import { loadShader, createProgram, switchShader, initAttribute, initBuffer } from '../lib/glu.js'
import useWindowDim from '../hooks/window-dim.js'
import styles from '../styles/SatVis.module.css'

const SatVis = props => {
    const { width, height } = useWindowDim()

    const canvRef = useRef()
    const glRef = useRef()
    const pointRef = useRef({})

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

    const initPrograms = async gl => {
        const pointVert = await loadShader(gl, gl.VERTEX_SHADER, './shaders/pointVert.glsl')
        const pointFrag = await loadShader(gl, gl.FRAGMENT_SHADER, './shaders/pointFrag.glsl')
        pointRef.current['program'] = createProgram(gl, pointVert, pointFrag)
    }

    const initShaderVars = gl => {
        switchShader(gl, pointRef.current.program)

        pointRef.current['aPosition'] = initAttribute(gl, 'aPosition', 3, 3, 0, false, byteSize)
        const uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix')
        pointRef.current['uModelMatrix'] = uModelMatrix
        gl.uniformMatrix4fv(uModelMatrix, false, modelMatRef.current)
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
        initShaderVars(glRef.current)
        initBuffers(glRef.current)
        setupViewport(glRef.current)

        requestFrame(draw)
    }

    const draw = time => {
        const gl = glRef.current

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

        modelMatRef.current = mat4.fromRotation(mat4.create(), time/1000, [0, 1, 0])

        if (pointRef.current?.buffer) {
            switchShader(gl, pointRef.current.program)
            gl.bindBuffer(gl.ARRAY_BUFFER, pointRef.current.buffer)
            gl.vertexAttribPointer(pointRef.current.aPosition, 3, gl.FLOAT, false, 3 * byteSize, 0)
            gl.uniformMatrix4fv(pointRef.current.uModelMatrix, false, modelMatRef.current)
            gl.drawArrays(gl.POINTS, 0, props.data.length / 3)
        }

        requestFrame(draw)
    }

    useEffect(() => {
        initGl()
        return cancelFrame
    }, [])

    useEffect(() => {
        setupViewport(glRef.current)
    }, [width, height])

    return (
        <canvas className={styles.vis} ref={canvRef} width={width} height={height}></canvas>
    )
}

export default SatVis
