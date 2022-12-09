import { Component, OnInit, Input } from '@angular/core';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { Inst, Problem } from '../services/problem-backend.service'
import { canRefer, canJump, nodeToInst } from './utils'

export interface Node {
  color: string,
  id: string,
  label: string,
  isSelected: boolean
}

export interface Edge {
  label: string,
  source: string,
  target: string
}

@Component({
  selector: 'app-coding',
  templateUrl: './coding.component.html',
  styleUrls: ['./coding.component.css']
})
export class CodingComponent implements OnInit {
  /*
   * graph chart config
  */
  windowSize: [number, number] = [window.innerWidth * 0.65, window.innerHeight * 0.56];
  curve = shape.curveNatural;

  /*
    * control panel
  */
  hasSubmitted: boolean = false

  /*
    * memory bank
  */
  memory: number[] = Array(12).fill(0);

  /*
    * inst & prob
  */
  userInsts: Inst[] = [];
  selectedNode?: Node;
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
  links: Edge[] = [
  ];
  nodes: Node[] = [
  ];
  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();

  constructor() {

  }

  ngOnInit(): void {

  }

  // todo control panel
  submit(): void {
    console.log(this.userInsts);
  }

  play(): void {

  }

  nextStep(): void {

  }

  prevStep(): void {

  }

  select(node: Node): void {
    // handle jump
    if (this.selectedNode) {
      if(node === this.selectedNode){
        return;
      }
      let sourceInst = nodeToInst(this.userInsts, this.selectedNode);
      let sourceNode = this.selectedNode;
      if (canJump(sourceInst)) {
        // valid jump
        let targetInst = nodeToInst(this.userInsts, node);
        let targetNode = node;
        // clear old edges
        this.links = this.links.filter(e => {
          return e.source !== sourceNode.id || !e.label.includes('jump')
        });
        this.links.push({
          source: sourceNode.id,
          target: targetNode.id,
          label: 'jump to'
        });
        sourceInst.jumpTo = this.userInsts.indexOf(targetInst);
        this.nodes.forEach(temp => {
          temp.isSelected = false;
        });
        this.selectedNode = undefined;
        this.updateAll();
        return;
      }
    }
    // handle normal selection
    this.selectedNode = node;
    this.nodes.forEach(temp => {
      temp.isSelected = false;
    })
    node.isSelected = true;

  }

  selectMemory(memIndex: number): void {
    if (this.selectedNode) {
      let old = this.selectedNode.label;
      let inst = nodeToInst(this.userInsts, this.selectedNode);
      if (canRefer(inst)) {
        if (old.includes(' ')) {
          this.selectedNode.label = old.split(' ')[0];
        }
        this.selectedNode.label += ' ' + memIndex;
        inst.referTo = memIndex;
        this.updateAll();
      }
    }
  }

  add(inst: Inst): void {
    let cnt = this.userInsts.length;
    let curr = cnt.toString();
    this.userInsts.push({
       name: inst.name,
       color: inst.color,
       referTo: inst.referTo,
       jumpTo: inst.jumpTo
    });
    this.nodes.push({
      id: curr,
      label: inst.name,
      color: inst.color,
      isSelected: false
    });
    if (cnt > 0) {
      let prev = (cnt - 1).toString();
      this.links.push({
        source: prev,
        target: curr,
        label: 'next'
      })
    }
    this.updateAll();
  }

  updateAll(): void {
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
      this.updateAll();
    }
  }
}
