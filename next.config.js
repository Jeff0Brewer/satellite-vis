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
    },
    async headers() {
        return [
            {
                source: '/:path*{/}?',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
                    { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
                    { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' }
                ]
            }
        ]
    }
}

module.exports = nextConfig
