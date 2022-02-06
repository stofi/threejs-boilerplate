import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
interface GalaxyParams {
    count: number
    size: number
    radius: number
    branches: number
    spin: number
    randomness: number
    randomnessPower: number
    insideColor: THREE.Color
    outsideColor: THREE.Color
}
const parameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.8,
    randomnessPower: 1,
    insideColor: new THREE.Color(0xff6030),
    outsideColor: new THREE.Color(0x1b3984),
}

gui.add(parameters, 'count').min(100).max(100000).step(100)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001)
gui.add(parameters, 'radius').min(0.001).max(20).step(0.01)
gui.add(parameters, 'branches').min(1).max(20).step(1)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001)
gui.add(parameters, 'randomnessPower').min(0).max(10).step(0.001)
gui.addColor(parameters, 'insideColor')
gui.addColor(parameters, 'outsideColor')

let galaxy: THREE.Points
let galaxyGeometry: THREE.BufferGeometry
let galaxyMaterial: THREE.PointsMaterial
let galaxyPositions: Float32Array
let galaxyColors: Float32Array
const generateGalaxy = (params: GalaxyParams) => {
    if (galaxy) {
        scene.remove(galaxy)
        galaxyGeometry.dispose()
        galaxyMaterial.dispose()
    }
    galaxyGeometry = new THREE.BufferGeometry()
    galaxyPositions = new Float32Array(params.count * 3)
    galaxyColors = new Float32Array(params.count * 3)
    for (let i = 0; i < params.count; i++) {
        const angle = 2 * Math.PI * ((i % params.branches) / params.branches)
        const radius = params.radius * Math.random()
        const spin = angle + params.spin * radius
        const getRandom = () => (Math.random() - 0.5) * params.randomness
        // *radius
        const random = new THREE.Vector3(getRandom(), getRandom(), getRandom())
        random.multiplyScalar(
            Math.abs(Math.pow(random.length(), params.randomnessPower))
        )
        if (i < 20) {
            console.log(random)
        }
        const position = new THREE.Vector3(Math.cos(spin), 0, Math.sin(spin))
        position.multiplyScalar(radius)
        position.add(random)

        galaxyPositions[i * 3] = position.x
        galaxyPositions[i * 3 + 1] = position.y
        galaxyPositions[i * 3 + 2] = position.z

        const color = params.insideColor.clone()
        color.lerp(params.outsideColor, radius / params.radius)

        galaxyColors[i * 3] = color.r
        galaxyColors[i * 3 + 1] = color.g
        galaxyColors[i * 3 + 2] = color.b
    }
    galaxyGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(galaxyPositions, 3)
    )
    galaxyGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(galaxyColors, 3)
    )

    galaxyMaterial = new THREE.PointsMaterial({
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })
    galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial)
    scene.add(galaxy)
}
gui.onFinishChange(() => {
    generateGalaxy(parameters)
})
generateGalaxy(parameters)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
