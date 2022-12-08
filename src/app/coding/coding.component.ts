import { Component, OnInit } from '@angular/core';
import * as shape from 'd3-shape';

@Component({
  selector: 'app-coding',
  templateUrl: './coding.component.html',
  styleUrls: ['./coding.component.css']
})
export class CodingComponent implements OnInit {

  /*
   * graph chart config
  */
  windowSize: [number, number] = [window.innerWidth * 0.65, window.innerHeight * 0.63];
  curve = shape.curveNatural;

  /*
    * control panel
  */

  /*
    * memory bank
  */

  /*
    * instructions
  */

  /*
    * graph data
  */
  links = [
    {
      id: 'a',
      source: 'first',
      target: 'second',
      label: 'is parent of'
    }, {
      id: 'b',
      source: 'first',
      target: 'third',
      label: 'custom label'
    }
  ];
  nodes = [
    {
      id: 'first',
      label: 'A'
    }, {
      id: 'second',
      label: 'B'
    }, {
      id: 'third',
      label: 'C'
    }
  ];
  constructor() {

  }

  ngOnInit(): void {

  }

  select(id: string): void {

  }

}
