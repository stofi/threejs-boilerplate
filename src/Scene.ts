import * as THREE from 'three'
import * as dat from 'lil-gui'

export default class Scene {
    gui: dat.GUI
    canvas: HTMLCanvasElement
    scene: THREE.Scene
    sizes: {
        width: number
        height: number
    }
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    clock: THREE.Clock
    elapsedTime = 0
    resizeCallback?: (sizes: { width: number; height: number }) => void
    tickCallback?: (time: number) => void

    constructor(canvas: HTMLCanvasElement) {
        this.gui = new dat.GUI()
        this.canvas = canvas
        this.scene = new THREE.Scene()
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
        }
        this.camera = new THREE.PerspectiveCamera(
            65,
            this.sizes.width / this.sizes.height,
            0.1,
            100
        )
        this.camera.position.y = 3
        this.camera.position.z = 2
        this.scene.add(this.camera)
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
        })
        this.camera.lookAt(new THREE.Vector3(0, -1, 0))
        this.clock = new THREE.Clock()

        this.onResize()
        this.addListeners()
        this.tick()
        this.scene.background = new THREE.Color('#121312')
        // is #debug in url
        if (window.location.hash !== '#debug') {
            this.gui.destroy()
        }
    }
    addListeners() {
        window.addEventListener('resize', this.onResize.bind(this))
    }
    removeListeners() {
        window.removeEventListener('resize', this.onResize.bind(this))
    }
    updateSizes() {
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight,
        }
    }
    onResize() {
        this.updateSizes()
        // Update camera
        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        // Update renderer
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(1)

        this.resizeCallback && this.resizeCallback(this.sizes)
    }
    tick() {
        this.elapsedTime = this.clock.getElapsedTime()
        this.renderer.render(this.scene, this.camera)

        window.requestAnimationFrame(this.tick.bind(this))
        this.tickCallback && this.tickCallback(this.elapsedTime)
    }
}
