import React from 'react'
import Head from 'next/head'
import '../styles/globals.css'

function MyApp ({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>Satellite Visualization</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
                <link rel="icon" type="image/png" href="./favicon.png"/>
            </Head>
            <Component {...pageProps} />
        </>
    )
}

export default MyApp
