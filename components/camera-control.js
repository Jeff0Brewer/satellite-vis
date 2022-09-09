const CameraControl = props => {
    const toggleMode = () => {
        if (props.mode === 'INERTIAL')
            props.setMode('FIXED')
        else
            props.setMode('INERTIAL')
    }

    const cancelFollow = () => {
        props.setFollowId('')
    }

    return (
        <section>
            <p>Camera reference:</p>
            
        </section>
    )
}

export default CameraControl
