import * as THREE from 'three'
import Experience from '../Experience'
import Environment from './Environment'
import type Resources from '../Utils/Resources'

import Plane from './Objects/Plane'
import type Base from './Objects/Base'

class World {
    experience: Experience
    scene: THREE.Scene
    resources: Resources
    environment?: Environment
    objects: Base[] = []

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.resources.on('ready', this.onReady.bind(this))
    }

    private onReady() {
        this.environment = new Environment()
        this.addObjects()
    }

    addObjects() {
        this.objects.push(new Plane())
    }

    resize() {
        this.objects.forEach((object) => object.resize())
    }

    update() {
        this.objects.forEach((object) => object.update())
    }
}
export default World
