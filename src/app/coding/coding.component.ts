import { Component, OnInit, Input } from '@angular/core';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { Inst, Problem } from '../services/problem-backend.service'

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
    * inst & prob
  */
  userInsts: Inst[] = [];
  userIndex: number = 0;
  prob: Problem = {
    title: 'title',
    description: 'description',
    input: '3;8;1',
    output: '3;8;1',
    memory: '12;-;-;-;-;-;-;-;-;-;0;10;100',
    instructions: [
      {
        name: 'inbox',
        color: 'green',
        referTo: -1,
        jumpTo: -1
      },
      {
        name: 'copyfrom',
        color: 'red',
        referTo: -1,
        jumpTo: -1
      },
      {
        name: 'add',
        color: 'orange',
        referTo: -1,
        jumpTo: -1
      },
      {
        name: 'jump',
        color: 'blue',
        referTo: -1,
        jumpTo: -1
      },
    ],
    solutions: []
  };

  /*
    * graph data
  */
  links: any[] = [
  ];
  nodes: any[] = [
  ];
  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();

  constructor() {

  }

  ngOnInit(): void {

  }

  select(id: string): void {

  }

  add(inst: Inst): void {
    let cnt = this.userInsts.length;
    let curr = cnt.toString();
    this.userInsts.push(inst);
    this.nodes.push({
      id: curr,
      label: inst.name,
      color: inst.color

    });
    if (cnt > 0) {
      let prev = (cnt - 1).toString();
      this.links.push({
        source: prev,
        target: curr,
        label: ''
      })
    }
    this.update();
  }

  update(): void {
    this.center$.next(true);
    this.update$.next(true);
  }

  delete(): void {
    let idx = this.userInsts.length;
    if (idx > 0) {
      this.userInsts.pop();
      let curr = (idx - 1).toString();
      this.nodes = this.nodes.filter(e => e.id !== curr);
      this.links = this.links.filter(e => e.source !== curr && e.target !== curr)
      this.update();
    }
  }

}
