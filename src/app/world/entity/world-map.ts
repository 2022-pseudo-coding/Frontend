import * as THREE from 'three';
import { SceneDirective } from "../basics/scene.directive";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import * as CANNON from 'cannon';


export class WorldMap {
    mixer!: THREE.AnimationMixer;
    sceneDirective: SceneDirective;
    model!: THREE.Group;
    mapId: string;
    baseUrl: string = '../../../assets/model/map/';
    world: CANNON.World;

    constructor(sceneDirective: SceneDirective, mapId: string, world: CANNON.World) {
        this.sceneDirective = sceneDirective;
        this.mapId = mapId;
        this.world = world;
    }

    load(): Promise<boolean> {
        switch (this.mapId) {
            case 'camp':
                return this.loadCamp();
            case 'island':
                return this.loadIsland();
            case 'forest':
                return this.loadForest();
        }
        return this.loadCamp();
    }

    loadCamp(): Promise<boolean> {
        const gltfLoader = new GLTFLoader();
        return new Promise((resolve) => {
            gltfLoader.setPath(this.baseUrl + 'camp/').load('scene.gltf', gltf => {
                this.model = gltf.scene;
                this.preprocess(13, [5, 0, -130], -Math.PI * 3 / 8);
                this.addPhysics();
                resolve(true);
            });
        })
    }

    loadIsland(): Promise<boolean> {
        const gltfLoader = new GLTFLoader();
        return new Promise((resolve) => {
            gltfLoader.setPath(this.baseUrl + 'island/').load('scene.gltf', gltf => {
                this.model = gltf.scene;
                this.preprocess(3.5, [0, -30, -250], -Math.PI);
                this.addPhysics();
                resolve(true);
            });
        })
    }

    loadForest(): Promise<boolean> {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();
        let url = {
            model: this.baseUrl + 'lava/model.obj',
            tex: this.baseUrl + 'lava/model.mtl'
        };
        return new Promise((resolve) => {
            mtlLoader.load(url.tex, mat => {
                mat.preload();
                objLoader.setMaterials(mat);
                objLoader.load(url.model, object => {
                    this.model = object;
                    this.preprocess(0.04, [0, 0, 243], 0);
                    resolve(true);
                });
            });

        });
    }

    setMatrix(model: THREE.Object3D, scale: number, position: number[], rotationY: number){
        model.scale.set(scale, scale, scale);
        model.position.set(position[0], position[1], position[2]);
        model.rotation.y = rotationY;
    }

    preprocess(scale: number, position: number[], rotationY: number): void {
        this.setMatrix(this.model, scale, position, rotationY);
        this.model.traverse(node => {
            if ((node as THREE.Mesh).isMesh) {
                node.castShadow = true;
                ((node as THREE.Mesh).material as any).side = THREE.DoubleSide;
            }
        })
        this.sceneDirective.add(this.model);
    }

    addPhysics() {
        let wall = new THREE.Mesh(new THREE.BoxGeometry(5, 10, 5));
        let plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100));
        const wallBody = new CANNON.Body({
            position: new CANNON.Vec3(0, 10, 0),
            allowSleep:true,
            mass: 0,
            shape: threeToCannon(wall as any, { type: ShapeType.BOX })?.shape as any
        });
        const groundMat = new CANNON.Material('ground')
        groundMat.friction = 0.3;
        const planeBody = new CANNON.Body({
            position: new CANNON.Vec3(0, 0, 0),
            allowSleep:true,
            mass: 0,
            material: groundMat, 
            shape: threeToCannon(plane as any, { type: ShapeType.BOX })?.shape as any
        });
        planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI / 2);
        wallBody.sleep();
        this.world.addBody(wallBody);
        this.world.addBody(planeBody);
    }

    dispose(): void {
        this.model.traverse(temp => {
            this.sceneDirective.remove(temp);
        })
    }
}