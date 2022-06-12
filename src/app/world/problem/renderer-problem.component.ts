import { AfterViewInit, Component, ViewChild, ElementRef, ContentChild, Input, OnDestroy } from '@angular/core';
import { SceneDirective } from '../basics/scene.directive';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import DragControls from 'drag-controls';
import { Mesh, Object3D } from 'three';
import { InstructionDirective } from '../mesh/instruction.directive';
import { ProblemService } from './problem.service';

CameraControls.install({ THREE });
DragControls.install({ THREE });

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
  dragableObj!: Array<Object3D>;

  insList: Array<Array<number>>;
  insTargetMeshList: Array<Array<Mesh>>;
  moveList: Array<Object3D>;
  pageOffset: number;

  constructor(public problemEventService: ProblemService) {
    if (this.mode === 'fullscreen') {
      this.width = window.innerWidth * 0.4;
      this.height = window.innerHeight * 0.85;
    } else if (this.mode === 'xxxx') {
      //TODO
      this.width = 200;
      this.height = 200;
    }
    this.insList = new Array<Array<number>>();
    for (let i = 0; i <= 49; i++)this.insList.push([-1, 0]);
    this.pageOffset = 0;
    this.moveList = new Array<Object3D>();
    this.insTargetMeshList = new Array<Array<Mesh>>();
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

    this.UIInit();

    /* init controls */
    this.dragableObj = new Array<Object3D>();
    this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
    this.dragControls = new DragControls(this.dragableObj, this.camera, this.canvas);
    (this.dragControls as any).enabled = true;
    this.cameraControls.enabled = false;
    this.dragControls.addEventListener('dragend', event => {
      let obj = event['object'];
      if (Math.abs(obj.position.x + 12) < 5 && Math.abs(Math.abs(obj.position.z % 10) - 5) < 3) {
        let insLineHeight = obj.position.z - obj.position.z % 10 + (obj.position.z > 0 ? 5 : -5);
        let index = (insLineHeight + 35) / 10 + this.pageOffset;
        if (this.insList[index][0] == -1) {
          this.insList[index][0] = 0;
          obj.position.setX(-12);
          obj.position.setY(15);
          obj.position.setZ(insLineHeight);
          this.moveList.push(obj);
          this.showInsTarget(index);
        }
      }
      if (Math.abs(obj.position.x - 22) < 10 && Math.abs(obj.position.z - 35) < 10) {
        this.scene.remove(obj);
        for (let i = 0; i < this.dragableObj.length; i++)
          if (this.dragableObj[i] === obj)
            this.dragableObj.splice(i, 1);
      }
    });
    this.dragControls.addEventListener('dragstart', event => {
      let obj = event['object'];
      if (Math.abs(obj.position.x + 12) < 1 && Math.abs(Math.abs(obj.position.z % 10) - 5) < 1) {
        let insLineHeight = obj.position.z - obj.position.z % 10 + (obj.position.z > 0 ? 5 : -5);
        let index = (insLineHeight + 35) / 10 + this.pageOffset;
        if (this.insList[index][0] != -1) {
          for (let i = 100; i < this.moveList.length; i++)
            if (this.moveList[i] === obj)
              this.moveList.splice(i, 1);
          this.insList[index][0] = -1;
          this.changeInsTarget(index, 0);
          this.hideInsTarget(index);
        }
      }
    });


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
      // if (this.mode === 'fullscreen') {
      //   this.width = window.innerWidth;
      //   this.height = window.innerHeight;

      // } else if (this.mode === 'xxxx') {
      //   //TODO
      //   this.width = 200;
      //   this.height = 200;
      // }

      this.adjustAspect();
    });
    window.addEventListener("click", event => {
      event.preventDefault();
      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouse.x /= 0.4;
      mouse.y /= 0.85;
      if (Math.abs(mouse.x) < 1 && Math.abs(mouse.y) < 1) {
        raycaster.setFromCamera(mouse, this.camera);
        var intersects = raycaster.intersectObjects(this.scene.meshes);
        let name = intersects[0].object.name
        console.log(name);
        switch (name) {
          case "pageUp": this.pageMove(-1); break;
          case "pageDown": this.pageMove(1); break;
        }
        if (name.substring(0, 9) === "insTarget") {
          if (name.charAt(9) == "A") {
            let index = Number(name.substring(15));
            let current = Number(this.insTargetMeshList[index][0].name.substring(17));

            if (name.charAt(12) == "1")
              this.changeInsTarget(index, current + 10);
            if (name.charAt(12) == "0")
              this.changeInsTarget(index, current + 1);
          }
          if (name.charAt(9) == "M") {
            let index = Number(name.substring(17));
            let current = Number(this.insTargetMeshList[index][0].name.substring(17));
            if (name.charAt(14) == "1")
              this.changeInsTarget(index, current - 10);
            if (name.charAt(14) == "0")
              this.changeInsTarget(index, current - 1);
          }
        }
      }
    })

    this.problemEventService.problemEventEmitter.subscribe((value: any) => {
      if (value.ins == "add") {
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

  pageMove(offset: number): void {
    if (this.pageOffset + offset < 0 || this.pageOffset + offset > 45) return
    this.pageOffset += offset;
    for (let i = 0; i < this.moveList.length; i++) {
      this.moveList[i].position.setZ(this.moveList[i].position.z - offset * 10);
    }
  }

  UIInit(): void {
    for (let i = 0; i <= 49; i++) {
      this.addIndex(i);
      this.addInsPosHint(i);
      this.addInsTarget(i);
    }
    this.addPageControlUI();
    this.addDeleteZone();
    this.addStepControl();
  }

  addIns(): void {
    let ins = this.addSimplePicMesh('../../../assets/icons/problem/default.jpg', 20, 8, 20, 13, 0);
    this.dragableObj.push(ins);
  }

  addIndex(index: number): void {
    let text = index.toString();
    if (index <= 9) text = "0" + text;
    let res = this.addTextBlock(text, 25, 150, -25, -35 + index * 10);
    this.moveList.push(res);
    res.name = "index" + index;
  }

  addInsTarget(index: number): void {
    let insTargetMeshPackage = new Array<Mesh>();
    let indexText = index.toString();
    if (index <= 9) indexText = "0" + indexText;
    let text = this.addTextBlock("00", 25, 150, 3, -35 + index * 10);
    let add10 = this.addSimplePicMesh('../../../assets/icons/problem/numAdd.png', 1.8, 1.8, 2.3, 11.1, -35 + index * 10 - 1.6);
    let add1 = this.addSimplePicMesh('../../../assets/icons/problem/numAdd.png', 1.8, 1.8, 3.8, 11.1, -35 + index * 10 - 1.6);
    let minus10 = this.addSimplePicMesh('../../../assets/icons/problem/numMinus.png', 1.8, 1.8, 2.3, 11.1, -35 + index * 10 + 1.6);
    let minus1 = this.addSimplePicMesh('../../../assets/icons/problem/numMinus.png', 1.8, 1.8, 3.8, 11.1, -35 + index * 10 + 1.6);
    text.name = "insTargetText_" + indexText + "_00";
    add10.name = "insTargetAdd10_" + indexText;
    add1.name = "insTargetAdd01_" + indexText;
    minus10.name = "insTargetMinus10_" + indexText;
    minus1.name = "insTargetMinus01_" + indexText;
    insTargetMeshPackage.push(text, add10, add1, minus10, minus1);
    this.insTargetMeshList.push(insTargetMeshPackage);
    this.moveList.push(text, add10, add1, minus10, minus1);
    this.hideInsTarget(index);
  }

  changeInsTarget(index: number, target: number) {
    let old = this.insTargetMeshList[index][0];
    let text = target.toString();
    if (target <= 9) text = "0" + text;
    console.log(text);
    let updated = this.addTextBlock(text, 25, 150, 3, old.position.z);
    updated.name = old.name.substring(0, 17) + text;
    this.insTargetMeshList[index][0] = updated;
    this.insList[index][1] = target;
    this.scene.remove(old);
  }

  hideInsTarget(index: number): void {
    for (let i = 0; i <= 4; i++) {
      this.insTargetMeshList[index][i].position.x = -1000;
    }
  }

  showInsTarget(index: number): void {
    this.insTargetMeshList[index][0].position.x = 3;
    this.insTargetMeshList[index][1].position.x = 2.3;
    this.insTargetMeshList[index][2].position.x = 3.8;
    this.insTargetMeshList[index][3].position.x = 2.3;
    this.insTargetMeshList[index][4].position.x = 3.8;
  }
  addPageControlUI(): void {
    for (let i = 0; i <= 1; i++) {
      let text = i == 0 ? "↑" : "↓"
      this.addTextBlock(text, 65, 135, -31, -37 + i * 74).name = "page" + (i == 0 ? "Up" : "Down");
    }
  }

  addDeleteZone(): void {
    this.addSimplePicMesh('../../../assets/icons/problem/deleteZone.png', 18, 18, 22, 12, 30).name = "deleteZone";
  }

  addInsPosHint(index: number): void {
    let res = this.addSimplePicMesh('../../../assets/icons/problem/insPosHint.png', 20, 8, -12, 11, -35 + index * 10)
    this.moveList.push(res);
    res.name = "insPosHint" + index;
  }

  addStepControl(): void {
    this.addSimplePicMesh('../../../assets/icons/problem/nextStep.png', 15, 5, 22, 12, -35);
    this.addSimplePicMesh('../../../assets/icons/problem/previousStep.png', 15, 5, 22, 12, -30);
    this.addSimplePicMesh('../../../assets/icons/problem/run.png', 15, 5, 22, 12, -25);

  }

  addTextBlock(text: string, canvasX: number, canvasY: number, x: number, z: number): Mesh {
    let canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    let ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.font = "bolder 140px Arial ";
      ctx.fillText(text, canvasX, canvasY);
      ctx.globalAlpha = 0.5;
    }

    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    let material = new THREE.MeshBasicMaterial({
      map: texture
    });

    material.map!.repeat.x = material.map!.repeat.y = 1;
    let object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(4, 4, 30, 30),
      material
    );
    object.receiveShadow = true;
    object.rotation.x = - Math.PI / 2;

    this.scene.add(object);
    object.position.set(x, 11, z);

    return object;
  }

  addSimplePicMesh(picPath: string, width: number, height: number, posX: number, posY: number, posZ: number): Mesh {
    const loader = new THREE.TextureLoader();

    let tex = loader.load(picPath);
    let material = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true
    });

    material.map!.repeat.x = material.map!.repeat.y = 1;

    let object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(width, height, 30, 30),
      material
    );
    object.receiveShadow = true;
    object.rotation.x = - Math.PI / 2;

    this.scene.add(object);
    object.position.set(posX, posY, posZ);
    return object;
  }





}
