import { SceneDirective } from '../basics/scene.directive';
import * as THREE from 'three';
import { AbstractPlayer } from './abstract-player';


export class OtherPlayer extends AbstractPlayer {
    quaternion: THREE.Quaternion = new THREE.Quaternion(0,0,0,0);
    walkDir: THREE.Vector3 = new THREE.Vector3(0,0,0);
    currentAction: string = "idle";

    constructor(sceneDirective: SceneDirective, username: string) {
        super(sceneDirective, username);
    }

    // animation loop
    update(delta: number): void {
        if (this.currentAction !== this.activeAction) {
            const to = this.actionMap.get(this.currentAction);
            const curr = this.actionMap.get(this.activeAction);
            curr?.fadeOut(.2);
            to?.reset().fadeIn(0.2).play();
            this.activeAction = this.currentAction;
        }
        this.mixer.update(delta);

        // update and position
        if (this.activeAction === 'walk') {
            this.model.quaternion.set(this.quaternion.x, this.quaternion.y, this.quaternion.z, this.quaternion.w)
            const moveX = -this.walkDir.x * 8 * delta;
            const moveZ = -this.walkDir.z * 8 * delta;
            this.model.position.x += moveX;
            this.model.position.z += moveZ;
        }
    }

    setState(quaternion: number[], walkDir: number[], currentAction: string, position: number[]){
        this.quaternion.set(quaternion[0], quaternion[1], quaternion[2], quaternion[3]);
        this.walkDir.set(walkDir[0], walkDir[1], walkDir[2]);
        this.currentAction = currentAction;
        this.model.position.set(position[0], position[1], position[2]);
    }
}