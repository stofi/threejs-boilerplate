import * as THREE from 'three'
import './entry.css'
import './style.css'
import Scene from './Scene'
import perlinNoise2D from './shaders/perlin2d.glsl'
import vertexShader from './shaders/waves.vert'
import fragmentShader from './shaders/waves.frag'
import * as musicMetadata from 'music-metadata-browser'

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

const audio = document.getElementById('audio')! as HTMLAudioElement

const title = document.getElementById('title')! as HTMLSpanElement
const track = document.getElementById('track')! as HTMLDivElement
const artist = document.getElementById('artist')! as HTMLDivElement
const dropzone = document.getElementById('dropzone')! as HTMLDivElement
const noautoplay = document.getElementById('noautoplay')! as HTMLDivElement

// let arrayBuffer
let audioContext
let source
let analyser: AudioNode
let bufferLength: number
let dataArray: Uint8Array

const dTexSize = 64
const step = 1

const dataTexture = new THREE.DataTexture(
    new Uint8Array(dTexSize * dTexSize * 4),
    dTexSize,
    dTexSize,
    THREE.RGBAFormat
)
dataTexture.needsUpdate = true

let loaded = false

const setupAudio = async (inputEvent?: InputEvent | File) => {
    // if (loaded) return
    if (!inputEvent) return

    let file
    if (inputEvent instanceof File) {
        file = inputEvent
    } else {
        const element = inputEvent.currentTarget as HTMLInputElement
        const fileList: FileList | null = element.files
        if (!fileList) return
        file = fileList[0]
    }
    audio.src = URL.createObjectURL(file)

    const tags = await musicMetadata.parseBlob(file)
    track.innerText = `${tags.common.title}`

    artist.innerText = `${tags.common.artist}`
    title.classList.add('hidden')
    // is auto play confirmed allowed?
    startAudio()
}

let first = true
const startAudio = async () => {
    audio.pause()
    audio.volume = 0.5
    audio.load()
    const success = await audio
        .play()
        .then(() => true)
        .catch(() => false)
    if (!success) {
        noautoplay.classList.remove('hidden')

        first &&
            document.addEventListener('click', () => {
                startAudio()
                noautoplay.classList.add('hidden')
            })
        first = false
        return
    }
    // arrayBuffer = await file.arrayBuffer()
    audioContext = new AudioContext()
    source = audioContext.createMediaElementSource(audio)
    analyser = audioContext.createAnalyser()

    source.connect(analyser)
    analyser.connect(audioContext.destination)
    // @ts-ignore
    analyser.smoothingTimeConstant = 0.4

    // @ts-ignore
    analyser.fftSize = dTexSize

    // @ts-ignore
    bufferLength = analyser.frequencyBinCount

    dataArray = new Uint8Array(bufferLength)
    loaded = true
    debugObject.noiseAudio = 0
    plane.material.uniforms.uNoiseAudio.value = 0

    let i = 0
    scene.tickCallback = (time) => {
        if (i === 0) {
            // @ts-ignore
            analyser.getByteFrequencyData(dataArray)

            // // shift data texture by one row
            for (let i = 0; i < dTexSize * dTexSize - dTexSize; i++) {
                const i4 = i * 4
                // shift by one row
                dataTexture.image.data[i4 + 0] =
                    dataTexture.image.data[i4 + 0 + dTexSize * 4]
                dataTexture.image.data[i4 + 1] =
                    dataTexture.image.data[i4 + 1 + dTexSize * 4]
                dataTexture.image.data[i4 + 2] =
                    dataTexture.image.data[i4 + 2 + dTexSize * 4]
                dataTexture.image.data[i4 + 3] = 1
            }

            for (let index = 0; index < bufferLength; index++) {
                const dTIndex = (dTexSize * dTexSize - dTexSize) * 4 + index * 4
                dataTexture.image.data[dTIndex + 0] = dataArray[index]
                dataTexture.image.data[dTIndex + 1] = dataArray[index]
                dataTexture.image.data[dTIndex + 2] = dataArray[index]
                dataTexture.image.data[dTIndex + 3] = 1
            }
            i = step
            dataTexture.needsUpdate = true
        } else {
            i--
        }

        plane.material.uniforms.uTime.value = time
    }
}

document.addEventListener('click', (event) => {
    // if target is canvas
    if (event.target === canvas) {
        setupAudio()
    }
})

document.addEventListener('drop', (event) => {
    event.preventDefault()
    canvas.classList.remove('opacity-50')
    if (event && event.dataTransfer && event.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (event.dataTransfer.items[i].kind === 'file') {
                const file = event.dataTransfer.items[i].getAsFile()
                file && setupAudio(file)
            }
        }
    }
})

document.addEventListener('dragover', (event) => {
    event.preventDefault()
    canvas.classList.add('opacity-50')
})

document.addEventListener('dragleave', (event) => {
    canvas.classList.remove('opacity-50')
})
document.addEventListener('dragend', (event) => {
    canvas.classList.remove('opacity-50')
})
document.addEventListener('dragstart', (event) => {
    canvas.classList.add('opacity-50')
})

const debugObject = {
    width: 32,
    height: 8,
    waveHeight: 4.0,
    maskPower: 8.0,
    speed: 0.5,
    noiseAudio: 1.0,
    textureScale: new THREE.Vector2(2, 1.01),
}

const scene = new Scene(canvas)

const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2, 1024, 256),
    new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uResolution: {
                value: new THREE.Vector2(canvas.width, canvas.height),
            },
            uWidth: { value: debugObject.width },
            uHeight: { value: debugObject.height },
            uWaveHeight: { value: debugObject.waveHeight },
            uMaskPower: { value: debugObject.maskPower },
            uSpeed: { value: debugObject.speed },
            uNoiseAudio: { value: debugObject.noiseAudio },
            uData: { value: dataTexture },
            uTextureScale: { value: debugObject.textureScale },
        },
        vertexShader: perlinNoise2D + vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
    })
)

scene.resizeCallback = (sizes) => {
    plane.material.uniforms.uResolution.value.set(sizes.width, sizes.height)
}
scene.tickCallback = (time) => {
    plane.material.uniforms.uTime.value = time
}

scene.scene.add(plane)
plane.rotateX(-Math.PI / 2)

scene.gui.add(debugObject, 'height', 1, 18, 1).onChange((value: number) => {
    plane.material.uniforms.uHeight.value = value
})
scene.gui
    .add(debugObject, 'waveHeight', 1, 10, 0.01)
    .onChange((value: number) => {
        plane.material.uniforms.uWaveHeight.value = value
    })

scene.gui
    .add(debugObject, 'maskPower', 1, 16, 1)
    .onFinishChange((value: number) => {
        plane.material.uniforms.uMaskPower.value = value
    })
scene.gui
    .add(debugObject, 'speed', 0.0, 3.0, 0.01)
    .onChange((value: number) => {
        plane.material.uniforms.uSpeed.value = value
    })

scene.gui
    .add(debugObject.textureScale, 'x', 0.0, 10.0, 0.01)
    .name('textureScale.x')
    .onChange((value: number) => {
        plane.material.uniforms.uTextureScale.value.x = value
    })
scene.gui
    .add(debugObject.textureScale, 'y', 0.0, 10.0, 0.01)
    .name('textureScale.y')
    .onChange((value: number) => {
        plane.material.uniforms.uTextureScale.value.y = value
    })
