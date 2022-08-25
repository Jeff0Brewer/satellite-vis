import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const WasmTest = dynamic({
    loader: async () => {
        const wasm = await import('../wasm/sgp4-wrap/pkg')
        return () => {
            const tle = {
                name: 'test',
                line1: "1 53131U 22082D   22226.51219016  .00006642  00000+0  18441-3 0  9994",
                line2: "2 53131  97.3586 234.4453 0046740 265.3749  94.2156 15.36129067  4545"
            }
            useEffect(() => {
                const elements = wasm.elements_from_tle(tle.name, tle.line1, tle.line2)
                const state = wasm.propagate(elements, 1)
                console.log(elements)
                console.log(state)
            }, [])
            return (
                <></>
            )
        }
    }
})

export default WasmTest
