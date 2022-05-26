import { AfterViewInit, Component, ViewChild, ElementRef, ContentChild, Input, OnDestroy } from '@angular/core';
import { SceneDirective } from '../basics/scene.directive';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import DragControls from 'drag-controls';
import { Object3D } from 'three';
import { InstructionDirective } from '../mesh/instruction.directive';
import { ProblemService } from './problem.service';

CameraControls.install({THREE});
DragControls.install({THREE});

@Component({
  selector: 'three-renderer-problem',
  template: '<canvas #canvas></canvas>'
})
export class RendererProblemComponent implements AfterViewInit {
  width!: number;
  height!: number;
  @Input() mode: string = "fullscreen";

  @ViewChild('canvas') canvasReference!: ElementRef;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  @ContentChild(SceneDirective) scene!: SceneDirective

  renderer!: THREE.WebGLRenderer;
  camera!: THREE.OrthographicCamera;
  cameraControls!: CameraControls;
  dragControls!: DragControls;
  dragableObj!:Array<Object3D>;

  constructor(public problemEventService:ProblemService) {
    if (this.mode === 'fullscreen') {
      this.width = window.innerWidth*0.4;
      this.height = window.innerHeight;
    } else if (this.mode === 'xxxx') {
      //TODO
      this.width = 200;
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

    this.camera = new THREE.OrthographicCamera(this.width / - 20, this.width / 20, this.height / 20, this.height / - 20, 1, 100);
    this.camera.position.set(0, 18, 0);
    this.camera.lookAt(0, 0, 0);

    this.adjustAspect();
    this.initWindowEvt();

    /* init controls */
    this.dragableObj = new Array<Object3D>();
    for(var i = 1 ; i < this.scene.meshes.length ; i++)
    {
      this.dragableObj.push(this.scene.meshes[i]);
    }
    this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
    this.dragControls = new DragControls(this.dragableObj, this.camera, this.canvas);
    (this.dragControls as any).enabled = true;
    this.cameraControls.enabled = false;

    //animation loop
    const clock = new THREE.Clock();
    let animationId: number;
    const renderLoop = () => {
      const delta = clock.getDelta();

      //TODO update physics
      this.cameraControls.update(delta);

      this.renderer.render(this.scene.object, this.camera);

      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  adjustAspect(): void {
    this.renderer.setSize(this.width, this.height);
    this.camera.updateProjectionMatrix();
  }

  initWindowEvt(): void {
    window.addEventListener('resize', () => {
      if (this.mode === 'fullscreen') {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

      } else if (this.mode === 'xxxx') {
        //TODO
        this.width = 200;
        this.height = 200;
      }

      this.adjustAspect();
    });

    this.problemEventService.problemEventEmitter.subscribe((value:any)=>{
      if(value.ins=="add")
      {
        console.log(value.message);
        this.addIns();
      }
    });
    // press f to drag
    // window.addEventListener('keydown', e=>{
    //   this.cameraControls.enabled = false;
    //   (this.dragControls as any).enabled = true;
    // });
    // window.addEventListener('keyup', e=>{
    //   this.cameraControls.enabled = true;
    //   (this.dragControls as any).enabled = false;
    // });
  }

  addIns(): void {
    const loader = new THREE.TextureLoader();

    let tex = loader.load('../../../assets/icons/problem/default.jpg');
    let material = new THREE.MeshBasicMaterial({
      map: tex
    });

    material.map!.repeat.x = material.map!.repeat.y = 1;

    let object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(20, 10, 30, 30),
      material
    );
    object.receiveShadow = true;
    object.rotation.x = - Math.PI / 2;
    
    this.scene.add( object );
    this.dragableObj.push(object);
    object.position.set(0,11,0);

  }
}
