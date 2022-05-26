import { AfterViewInit, Directive, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObjectDirective } from '../basics/abstract-object.directive';

@Directive({
  selector: 'three-ground',
  providers: [{ provide: AbstractObjectDirective, useExisting: forwardRef(() => GroundDirective) }]
})
export class GroundDirective extends AbstractObjectDirective<THREE.Mesh> implements AfterViewInit {

  constructor() { super(); }

  override ngAfterViewInit(): void {

    let material = new THREE.MeshLambertMaterial({
      color: 0x00ebc0
    });

    this.object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(10000, 10000),
      material
    );
    this.object.receiveShadow = true;
    this.object.rotation.x = - Math.PI / 2;
    super.ngAfterViewInit();
  }

}
