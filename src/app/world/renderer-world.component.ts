import { AfterViewInit, Component, ViewChild, ElementRef, ContentChild, Input, OnDestroy } from '@angular/core';
import { SceneDirective } from './basics/scene.directive';
import * as THREE from 'three';
import { Player } from './entity/player'
import * as ORBIT from 'three/examples/jsm/controls/OrbitControls';
import * as CANNON from 'cannon';
import { Vector3 } from 'three';


@Component({
  selector: 'three-renderer-world',
  template: '<canvas #canvas></canvas>'
})
export class RendererWorldComponent implements AfterViewInit {
  width!: number;
  height!: number;
  @Input() mode: string = "fullscreen";

  @ViewChild('canvas') canvasReference!: ElementRef;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  @ContentChild(SceneDirective) scene!: SceneDirective

  renderer!: THREE.WebGLRenderer;
  camera!: THREE.PerspectiveCamera;
  world!: CANNON.World;

  myPlayer!: Player;
  keyPressed: Map<string, boolean> = new Map();

  constructor() {
    if (this.mode === 'fullscreen') {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    } else if (this.mode === 'xxxx') {
      //TODO
      this.width = 300;
      this.height = 200;
    }
  }

  ngAfterViewInit() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    /**GLTF */
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 100);
    this.camera.position.set(1, 11, 10);

    this.adjustAspect();
    this.initWindowEvt();


    const orbitControls = new ORBIT.OrbitControls(this.camera, this.renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.minDistance = 5;
    orbitControls.maxDistance = 20;
    orbitControls.enablePan = false;
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;

    orbitControls.target = new Vector3(0, 10, 0);
    orbitControls.update();
    
    this.myPlayer = new Player(this.scene, 'blueBot', this.keyPressed, this.camera, orbitControls);

    const clock = new THREE.Clock();
    let animationId: number;
    const renderLoop = () => {

      const delta = clock.getDelta();

      this.myPlayer.update(delta);

      orbitControls.update();

      // cameraControls.update(delta);
      //TODO update physics

      this.renderer.render(this.scene.object, this.camera);

      animationId = requestAnimationFrame(renderLoop);
    };

    this.myPlayer.load().then(result => {
      renderLoop();
    });

    this.initSocket();
  }

  adjustAspect(): void {
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  initWindowEvt(): void {
    window.addEventListener('resize', () => {
      if (this.mode === 'fullscreen') {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

      } else if (this.mode === 'xxxx') {
        //TODO
        this.width = 123;
        this.height = 123;
      }

      this.adjustAspect();
    });


    window.addEventListener('keydown', e => {
      this.keyPressed.set(e.key.toLowerCase(), true); 
    });
    window.addEventListener('keyup', e => {
      this.keyPressed.set(e.key.toLowerCase(), false);
    });
  }

  initSocket(): void {

  }

  initFps(): void {
    /* init controls */
    // this.fpsControls = new PointerLockControls(this.camera, this.renderer.domElement);

    // this.scene.add(this.fpsControls.getObject());
  }

  initCannon(): void {
    this.world = new CANNON.World();
  }

  updatePhysics(): void {

  }
}
