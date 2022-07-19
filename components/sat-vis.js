import React, { useRef, useEffect } from 'react'
import { mat4 } from 'gl-matrix'
import { loadShader, createProgram, switchShader, initAttribute, initBuffer, createCubemap } from '../lib/gl-help.js'
import { mouseRotate, scrollZoom } from '../lib/mouse-control.js'
import { incrementEpoch } from '../lib/epoch.js'
import getIcosphere from '../lib/icosphere.js'
import keplerianAttribs from '../models/keplerAttrib.js'
import useWindowDim from '../hooks/window-dim.js'
import styles from '../styles/SatVis.module.css'

const SatVis = props => {
    const canvRef = useRef()
    const glRef = useRef()
    const frameIdRef = useRef()
    const epochRef = useRef()
    const satelliteRef = useRef({})
    const earthRef = useRef({})
    const modelMatRef = useRef(mat4.create())
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
    const byteSize = Float32Array.BYTES_PER_ELEMENT
    const visScale = .0000001

    const initPrograms = async gl => {
        const satelliteVert = await loadShader(gl, gl.VERTEX_SHADER, './shaders/satellite-vert.glsl')
        const satelliteFrag = await loadShader(gl, gl.FRAGMENT_SHADER, './shaders/satellite-frag.glsl')
        satelliteRef.current['program'] = createProgram(gl, satelliteVert, satelliteFrag)

        const earthVert = await loadShader(gl, gl.VERTEX_SHADER, './shaders/earth-vert.glsl')
        const earthFrag = await loadShader(gl, gl.FRAGMENT_SHADER, './shaders/earth-frag.glsl')
        earthRef.current['program'] = createProgram(gl, earthVert, earthFrag)
    }

    const initShaderVars = gl => {
        switchShader(gl, satelliteRef.current.program)
        keplerianAttribs.forEach((a, i) => satelliteRef.current[a] = initAttribute(gl, a, 1, keplerianAttribs.length, i, false, byteSize))
        satelliteRef.current['uYear'] = gl.getUniformLocation(gl.program, 'uYear')
        satelliteRef.current['uDay'] = gl.getUniformLocation(gl.program, 'uDay')
        satelliteRef.current['uSecond'] = gl.getUniformLocation(gl.program, 'uSecond')
        satelliteRef.current['uModelMatrix'] = gl.getUniformLocation(gl.program, 'uModelMatrix')
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uViewMatrix'), false, viewMatrix)
        gl.uniform1f(gl.getUniformLocation(gl.program, 'uScale'), visScale)

        switchShader(gl, earthRef.current.program)
        earthRef.current['aPosition'] = initAttribute(gl, 'aPosition', 3, 3, 0, false, byteSize)
        earthRef.current['uYear'] = gl.getUniformLocation(gl.program, 'uYear')
        earthRef.current['uDay'] = gl.getUniformLocation(gl.program, 'uDay')
        earthRef.current['uSecond'] = gl.getUniformLocation(gl.program, 'uSecond')
        earthRef.current['uModelMatrix'] = gl.getUniformLocation(gl.program, 'uModelMatrix')
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uViewMatrix'), false, viewMatrix)
        gl.uniform1i(gl.getUniformLocation(gl.program, 'uEarthMap'), 0)
        createCubemap(gl, 1024, [
            './earth-cubemap/posx.png', './earth-cubemap/negx.png',
            './earth-cubemap/posy.png', './earth-cubemap/negy.png',
            './earth-cubemap/posz.png', './earth-cubemap/negz.png'
        ], [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ])
    }

    const initBuffers = gl => {
        satelliteRef.current['buffer'] = initBuffer(gl, props.data, gl.STATIC_DRAW)
        satelliteRef.current['numVertex'] = props.data.length / keplerianAttribs.length

        let icoBuffer = []
        const { vertices, triangles } = getIcosphere(3)
        vertices = vertices.map(
            vertex => vertex.map(
                val => val*6371000*visScale
            )
        )
        triangles.forEach(triangle => {
            triangle.forEach(vertex => {
                icoBuffer.push(...vertices[vertex])
            })
        })
        earthRef.current['buffer'] = initBuffer(gl, new Float32Array(icoBuffer), gl.STATIC_DRAW)
        earthRef.current['numVertex'] = icoBuffer.length / 3
    }

    const setupViewport = gl => {
        const {innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
        gl.viewport(0, 0, w * dpr, h * dpr)
        const projMatrix = getProjMat((w * dpr)/(h * dpr))

        if (satelliteRef.current?.program) {
            switchShader(gl, satelliteRef.current.program)
            gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
        }
        if (earthRef.current?.program) {
            switchShader(gl, earthRef.current.program)
            gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'uProjMatrix'), false, projMatrix)
        }
    }

    const initGl = async () => {
        glRef.current = canvRef.current.getContext('webgl', { preserveDrawingBuffer: false })
        glRef.current.enable(glRef.current.DEPTH_TEST)
        glRef.current.enable(glRef.current.CULL_FACE)
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
        if (!glRef.current || !satelliteRef.current.buffer) return
        const gl = glRef.current
        gl.bindBuffer(gl.ARRAY_BUFFER, satelliteRef.current.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, props.data, gl.STATIC_DRAW)
        satelliteRef.current.numVertex = props.data.length / keplerianAttribs.length
    }, [props.data])
    
    useEffect(() => {
        epochRef.current = props.startEpoch
    }, [props.startEpoch])

    useEffect(() => {
        if (!epochRef.current) return
        let epoch = epochRef.current
        const gl = glRef.current

        let lastT = 0
        const tick = currT => {
            const elapsed = currT - lastT
            if (lastT != 0) 
                epoch = incrementEpoch(epoch, elapsed*props.clockSpeed)
            lastT = currT

            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
            if (satelliteRef.current?.buffer) {
                switchShader(gl, satelliteRef.current.program)
                gl.uniform1f(satelliteRef.current.uYear, epoch.year)
                gl.uniform1f(satelliteRef.current.uDay, epoch.day)
                gl.uniform1f(satelliteRef.current.uSecond, epoch.second)
                gl.uniformMatrix4fv(satelliteRef.current.uModelMatrix, false, modelMatRef.current)
                gl.bindBuffer(gl.ARRAY_BUFFER, satelliteRef.current.buffer)
                keplerianAttribs.forEach((attrib, i) => gl.vertexAttribPointer(satelliteRef.current[attrib], 1, gl.FLOAT, false, keplerianAttribs.length * byteSize, i * byteSize))
                gl.drawArrays(gl.POINTS, 0, satelliteRef.current.numVertex)
            }

            if (earthRef.current?.buffer) {
                const dt = ((epoch.year - 22)*365*86400) % 86400 + ((epoch.day*86400 - 0)) + (epoch.second - 0)
                const earthModelMat = mat4.multiply(mat4.create(),
                    modelMatRef.current,
                    mat4.fromZRotation(mat4.create(), dt/86400 * Math.PI * 2)
                )
                switchShader(gl, earthRef.current.program)
                gl.uniformMatrix4fv(earthRef.current.uModelMatrix, false, earthModelMat)
                gl.bindBuffer(gl.ARRAY_BUFFER, earthRef.current.buffer)
                gl.vertexAttribPointer(earthRef.current.aPosition, 3, gl.FLOAT, false, 3 * byteSize, 0)
                gl.drawArrays(gl.TRIANGLES, 0, earthRef.current.numVertex)
            }
            frameIdRef.current = window.requestAnimationFrame(tick)
        }
        frameIdRef.current = window.requestAnimationFrame(tick)

        return () => {
            window.cancelAnimationFrame(frameIdRef.current)
            epochRef.current = epoch
        }
    }, [props.startEpoch, props.clockSpeed, props.data])

    const { width, height } = useWindowDim()
    useEffect(() => {
        setupViewport(glRef.current)
    }, [width, height])

    return (
        <canvas className={styles.vis} ref={canvRef} width={width} height={height}></canvas>
    )
}

export default SatVis
