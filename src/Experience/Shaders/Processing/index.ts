import fragment from './fragment.glsl'
import vertex from './vertex.glsl'

const FX = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        brightness: { value: 1.14 },
        contrast: { value: 1.8 },
        saturation: { value: 0.4 },
        hue: { value: 0 },
        seekDisortionAmount: { value: 0.05 },
        seekDisortionSpeed: { value: 0.0 },
        userBrightness: { value: 0.5 },
    },

    fragmentShader: fragment,
    vertexShader: vertex,
}

export default FX
