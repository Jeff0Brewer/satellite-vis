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
    const pointAttrib = ['aAxis', 'aEccentricity', 'aPeriapsis', 'aLngAcendingNode', 'aInclination', 'aAnomoly', 'aEpoch']

    const modelMatRef = useRef(mat4.create())
    const viewMatrix = mat4.lookAt(mat4.create(), 
        [0, 0, 3], // camera position
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

    const initPrograms = async gl => {
        const pointVert = await loadShader(gl, gl.VERTEX_SHADER, './shaders/pointVert.glsl')
        const pointFrag = await loadShader(gl, gl.FRAGMENT_SHADER, './shaders/pointFrag.glsl')
        pointRef.current['program'] = createProgram(gl, pointVert, pointFrag)
    }

    const initShaderVars = gl => {
        switchShader(gl, pointRef.current.program)

        for(let i = 0; i < pointAttrib.length; i++)
            pointRef.current[pointAttrib[i]] = initAttribute(gl, pointAttrib[i], 1, 7, i, false, byteSize)
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
            gl.uniform1f(pointRef.current.uTime, props.time)

            gl.bindBuffer(gl.ARRAY_BUFFER, pointRef.current.buffer)
            for (let i = 0; i < pointAttrib.length; i++)
                gl.vertexAttribPointer(pointRef.current[pointAttrib[i]], 1, gl.FLOAT, false, 7 * byteSize , i * byteSize)

            gl.drawArrays(gl.POINTS, 0, props.data.length / 7)
        }
    }, [props.time])

    return (
        <canvas className={styles.vis} ref={canvRef} width={width} height={height}></canvas>
    )
}

export default SatVis
