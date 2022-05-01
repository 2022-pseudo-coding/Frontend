import { SceneDirective } from "../basics/scene.directive";
import * as THREE from 'three';
import * as ORBIT from 'three/examples/jsm/controls/OrbitControls'
import { AbstractPlayer } from "./abstract-player";

const directionsKeys = ['w', 'a', 's', 'd'];

export class Player extends AbstractPlayer {
    keyPressed: Map<string, boolean>;
    camera: THREE.Camera;
    orbitControls: ORBIT.OrbitControls;
    rotateQ = new THREE.Quaternion();
    rotateA = new THREE.Vector3(0, 1, 0);
    walkDir = new THREE.Vector3(0, 0, 0);
    cameraTarget = new THREE.Vector3();

    constructor(sceneDirective: SceneDirective,
        keyPressed: Map<string, boolean>,
        camera: THREE.Camera,
        orbitControls: ORBIT.OrbitControls,
        username: string) {
        super(sceneDirective, username);
        this.keyPressed = keyPressed;
        this.camera = camera;
        this.orbitControls = orbitControls;
    }

    // animation loop
    update(delta: number): void {
        const directionPressed = directionsKeys.some(key => this.keyPressed.get(key));
        let currentAction = directionPressed ? 'walk' : 'idle';
        if (currentAction !== this.activeAction) {
            const to = this.actionMap.get(currentAction);
            const curr = this.actionMap.get(this.activeAction);
            curr?.fadeOut(.2);
            to?.reset().fadeIn(0.2).play();
            this.activeAction = currentAction;
        }
        this.mixer.update(delta);

        // update and position
        if (this.activeAction === 'walk') {
            let dir = this.directionOffset();
            this.rotateQ.setFromAxisAngle(this.rotateA, Math.atan2(
                (this.camera.position.x - this.model.position.x),
                (this.camera.position.z - this.model.position.z)) + dir);
            this.model.quaternion.rotateTowards(this.rotateQ, .2);

            this.camera.getWorldDirection(this.walkDir);

            this.walkDir.y = 0;
            this.walkDir.normalize();
            this.walkDir.applyAxisAngle(this.rotateA, dir);

            const moveX = -this.walkDir.x * 8 * delta;
            const moveZ = -this.walkDir.z * 8 * delta;
            this.model.position.x += moveX;
            this.model.position.z += moveZ;
            // move camera
            this.camera.position.x += moveX
            this.camera.position.z += moveZ


            // update camera target
            this.cameraTarget.set(this.model.position.x, this.model.position.y + 10, this.model.position.z);
            this.orbitControls.target = this.cameraTarget;
        }

    }

    private directionOffset(): number {
        let result = Math.PI;

        if (this.keyPressed.get('w')) {
            if (this.keyPressed.get('a')) {
                result = 5 * Math.PI / 4;
            } else if (this.keyPressed.get('d')) {
                result = 3 * Math.PI / 4;
            }
        } else if (this.keyPressed.get('s')) {
            if (this.keyPressed.get('a')) {
                result = -Math.PI / 4;
            } else if (this.keyPressed.get('d')) {
                result = Math.PI / 4;
            } else {
                result = 0;
            }
        } else if (this.keyPressed.get('a')) {
            result = - Math.PI / 2
        } else if (this.keyPressed.get('d')) {
            result = Math.PI / 2
        }

        return result;
    }

    get quaternion(): THREE.Quaternion{
        return this.model.quaternion;
    }

    get position(): THREE.Vector3{
        return this.model.position;
    }
}