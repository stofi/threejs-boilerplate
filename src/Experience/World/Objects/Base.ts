import type Resources from '../../Utils/Resources'

import { EventEmitter } from '../../Utils/EventEmitter'

import * as THREE from 'three'
import Experience from '../../Experience'

class Base extends EventEmitter {
    experience: Experience
    scene: THREE.Scene
    resources: Resources
    mesh?: THREE.Mesh
    geometry?: THREE.BufferGeometry
    material?: THREE.Material

    constructor() {
        super()
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.initialize()
    }
    initialize() {
        throw new Error('Base.initialize must be implemented')
    }

    resize() {
        throw new Error('Base.resize must be implemented')
    }

    update() {
        throw new Error('Base.update must be implemented')
    }
}
export default Base
