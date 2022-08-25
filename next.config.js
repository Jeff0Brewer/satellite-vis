/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        config.experiments = { asyncWebAssembly: true, layers: true }
        if (isServer) {
            config.output.webassemblyModuleFilename = './../static/wasm/[hash].wasm'
        }
        else {
            config.output.webassemblyModuleFilename = 'static/wasm/[hash].wasm'
        }
        return config
    }
}

module.exports = nextConfig
