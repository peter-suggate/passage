import * as synth_types from "@/lib/audio/synth/synth-types"
// @ponicode
describe("synth_types.instrumentName", () => {
    test("0", () => {
        let callFunction: any = () => {
            synth_types.instrumentName("violin")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            synth_types.instrumentName("bell")
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("synth_types.defaultSynthConfig", () => {
    test("0", () => {
        let callFunction: any = () => {
            synth_types.defaultSynthConfig()
        }
    
        expect(callFunction).not.toThrow()
    })
})
