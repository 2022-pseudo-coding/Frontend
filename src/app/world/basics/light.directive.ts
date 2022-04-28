import { AfterViewInit, Directive, Input, forwardRef } from '@angular/core';
import { AbstractObjectDirective } from './abstract-object.directive';
import { Light, HemisphereLight, DirectionalLight } from 'three';

@Directive({
  selector: 'three-light',
  providers: [{ provide: AbstractObjectDirective, useExisting: forwardRef(() => LightDirective) }]
})
export class LightDirective extends AbstractObjectDirective<Light> implements AfterViewInit {

  @Input() HSL!: number[];
  @Input() mode!: string;

  constructor() { super(); }

  override ngAfterViewInit(): void {
    let light;
    switch (this.mode) {
      case 'hemi':
        light = new HemisphereLight(0xffffff, 0xffffff, 0.6);
        light.color.setHSL(0.6, 1, 0.6);
        light.groundColor.setHSL(0.095, 1, 0.75);
        break;
      case 'dir':
        light = new DirectionalLight(0xffffff, 1);
        light.color.setHSL(0.1, 1, 0.95);
        light.position.multiplyScalar(30);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        const d = 50;
        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;
        light.shadow.camera.far = 3500;
        light.shadow.bias = - 0.0001;
        break;
    }
    this.object = light as Light;
    super.ngAfterViewInit();
  }

}
