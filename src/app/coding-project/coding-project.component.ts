import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { catchError, EMPTY } from 'rxjs';
import { DataService } from '../services/data.service';
import { Inst, Problem, ProblemBackendService, Status } from '../services/problem-backend.service'
import { canRefer, canJump, nodeToInst } from '../coding/utils'
import { DialogComponent } from '../dialog/dialog.component';
import { Edge } from '../coding/coding.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project, Action, Module, ModProjService } from '../services/mod-proj.service';
import { isModule, nodeToAction, instIdToNodeId } from './utils';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { MatChipInputEvent, MatChipEvent, MatChip } from '@angular/material/chips';

export interface ActionNode {
  color: string,
  id: string,
  label: string,
  isSelected: boolean,
  /** for playing */
  isActive: boolean,
  canExpand: boolean,
  isExpanded: boolean
}

export interface Cluster {
  id: string,
  childNodeIds: string[],
}

@Component({
  selector: 'app-coding-project',
  templateUrl: './coding-project.component.html',
  styleUrls: ['./coding-project.component.css']
})
export class CodingProjectComponent implements OnInit {
  /*
     * graph chart config
    */
  windowSize: [number, number] = [window.innerWidth * 0.65, window.innerHeight * 0.46];
  curve = shape.curveNatural;

  /*
    * control panel
  */
  hasSubmitted: boolean = false;
  statusList: Status[] = [];
  statusPtr: number = -1;

  /*
    * all the lists
  */
  memory: string[] = Array(12).fill('0')
  inputs: string[] = Array(5).fill('0')
  outputs: string[] = []
  hand: string = 'Nothing';

  /*
    * inst & prob
  */
  modules: Module[] = [];
  actions: any[] = [];
  selectedNode?: ActionNode;
  prob!: Problem;
  project!: Project;
  projectId!: string;

  /*
    * graph data
  */
  links: Edge[] = [
  ];
  nodes: ActionNode[] = [
  ];
  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();

  constructor(private problemService: ProblemBackendService,
    private modProjService: ModProjService,
    private router: Router,
    private dataService: DataService,
    private dialog: MatDialog,
    private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.problemService.getProblem('3', '4').pipe(catchError(err => {
      localStorage.clear();
      this.dataService.isLoggedIn.next(false);
      this.router.navigate(['login']);
      return EMPTY;
    })).subscribe(result => {
      this.prob = result.problem;
      this.projectId = this.route.snapshot.queryParamMap.get('id')!;
      this.modProjService.getProjectById(this.projectId).subscribe(result => {
        this.project = result.project;
        this.actions = this.project.actions;
        this.modules = result.modules
        this.actions.forEach((action, index) => {
          this.addWithoutPush(index + '', action)
          this.updateAll();
        })
      })
    });

  }

  execute(): void {
    this.validate();
    // build insts
    let insts: Inst[] = []
    this.actions.forEach((action, i) => {
      if (isModule(action)) {
        //module
        (action as Module).instructions.forEach((modInst, j) => {
          let jump = modInst.jumpTo;
          for (let k = 0; k < i; k++) {
            jump += isModule(this.actions[k]) ? this.actions[k].instructions.length : 1
          }
          let temp: Inst = {
            name: modInst.name,
            referTo: modInst.referTo,
            jumpTo: canJump(modInst) ? jump : -1,
            color: modInst.color
          }
          insts.push(temp);
        })
      } else {
        // inst
        let temp: Inst;
        let jump = 0;
        for (let k = 0; k < action.jumpTo; k++) {
          jump += isModule(this.actions[k]) ? this.actions[k].instructions.length : 1
        }
        temp = {
          name: action.name,
          referTo: action.referTo,
          jumpTo: canJump(action) ? jump : -1,
          color: action.color
        }
        insts.push(temp);
      }
    });

    this.modProjService.projectForward(this.projectId, this.inputs, this.memory, insts).subscribe(result => {
      this.statusList = result.statusList
      this.hasSubmitted = true;
    })
  }

  validate(): void {
    for (let inst of this.actions) {
      if (canJump(inst) && inst.jumpTo < 0) {
        this.dialog.open(DialogComponent, {
          width: '300px',
          data: { title: 'Error', message: inst.name + ' must point to a target instruction' }
        });
        return;
      } else if (canRefer(inst) && inst.referTo < 0) {
        this.dialog.open(DialogComponent, {
          width: '300px',
          data: { title: 'Error', message: inst.name + ' must point to a memory location' }
        });
        return;
      }
    }
  }

  update(): void {
    this.validate();
    this.modProjService.updateProject(this.project.id, this.actions).subscribe(result => {
      this.dialog.open(DialogComponent, {
        width: '300px',
        data: { title: 'Message', message: result.message }
      });
    })
  }

  play(): void {
    this.hand = 'Nothing';
    this.outputs = [];
    this.nodes.forEach((el, index) => {
      el.isActive = false
      if (el.canExpand && !el.isExpanded) {
        this.expand(el);
      }
    });
    this.statusPtr = -1;
    let timer = setInterval(() => {
      if (this.statusPtr !== this.statusList.length - 2) {
        this.nextStep();
      } else {
        clearInterval(timer);
      }

    }, 500);

  }

  private updateFromStatus(status: Status): void {
    this.hand = status.hand ? status.hand : this.hand;
    let dict = instIdToNodeId(this.actions);
    this.nodes.forEach((node, index) => {
      //TODO: map instIndex to node index
      if (node.id === dict[status.instIndex]) {
        node.isActive = true;
      } else {
        node.isActive = false;
      }
    });
    this.outputs = status.output;
    this.inputs = status.input;
    this.memory.forEach((el, index) => {
      if (status.memory[index]) {
        this.memory[index] = status.memory[index]
      }
    })
  }

  nextStep(): void {
    if (this.statusPtr <= this.statusList.length - 3) {
      this.statusPtr++;
      this.updateFromStatus(this.statusList[this.statusPtr])
    }
  }

  prevStep(): void {
    if (this.statusPtr >= 1) {
      this.statusPtr--;
      this.updateFromStatus(this.statusList[this.statusPtr])
    } else {
      this.refresh();
    }
  }

  refresh(): void {
    this.hand = 'Nothing';
    this.memory = Array(12).fill('0');
    this.inputs = Array(5).fill('0');
    this.outputs = [];
    this.nodes.forEach((el, index) => {
      el.isActive = false
    });
    this.statusPtr = -1;
  }

  expand(currNode: ActionNode): void {
    currNode.isExpanded = !currNode.isExpanded;
    if (currNode.isExpanded) {
      let action = nodeToAction(this.actions, currNode) as Module;
      action.instructions.forEach((inst, i) => {
        let id = currNode.id + '-' + i;
        let newNode = {
          id: id,
          color: inst.color,
          label: inst.name + (canRefer(inst) ? ' ' + inst.referTo : ''),
          isSelected: false,
          isActive: false,
          canExpand: false,
          isExpanded: false
        };
        this.nodes.push(newNode);

        if (i == 0) {
          this.links.push({
            label: 'starts',
            source: currNode.id,
            target: id
          });
        }
        if (i == action.instructions.length - 1) {
          this.links.push({
            label: 'ends',
            source: id,
            target: currNode.id
          });
        }
        if (i > 0) {
          this.links.push({
            label: 'next',
            source: currNode.id + '-' + (i - 1),
            target: id
          });
        }
        // jump
        if (canJump(inst)) {
          this.links.push({
            label: 'jump to',
            source: id,
            target: currNode.id + '-' + inst.jumpTo
          })
        }
      })
    } else {
      this.nodes = this.nodes.filter(temp => !temp.id.includes(currNode.id + '-'));
      this.links = this.links.filter(temp => !temp.source.includes(currNode.id + '-') && !temp.target.includes(currNode.id + '-'));
    }
    this.updateAll();
  }

  select(node: ActionNode): void {
    // handle jump
    if (this.selectedNode) {
      if (node === this.selectedNode) {
        return;
      }
      let sourceInst = nodeToAction(this.actions, this.selectedNode);
      let sourceNode = this.selectedNode;
      if (!isModule(sourceInst)) {
        if (canJump(sourceInst as Inst)) {
          // valid jump
          let targetInst = nodeToInst(this.actions, node);
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
          (sourceInst as Inst).jumpTo = this.actions.indexOf(targetInst);
          this.nodes.forEach(temp => {
            temp.isSelected = false;
          });
          this.selectedNode = undefined;
          this.updateAll();
          return;
        }
      }
    }
    if (node.canExpand) {
      this.expand(node);
      return;
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
      let inst = nodeToAction(this.actions, this.selectedNode);
      if (!isModule(inst) && canRefer(inst)) {
        if (old.includes(' ')) {
          this.selectedNode.label = old.split(' ')[0];
        }
        this.selectedNode.label += ' ' + memIndex;
        (inst as Inst).referTo = memIndex;
        this.updateAll();
      }
    }
  }

  addWithoutPush(curr: string, action: Action) {
    if (isModule(action)) {
      this.nodes.push({
        id: curr,
        label: action.name,
        color: 'black',
        isSelected: false,
        isActive: false,
        isExpanded: false,
        canExpand: true
      })
    } else {
      let node = {
        id: curr,
        label: (action as Inst).name,
        color: (action as Inst).color,
        isSelected: false,
        isActive: false,
        isExpanded: false,
        canExpand: false
      };
      this.nodes.push(node);
      if (canJump(action as Inst) && (action as Inst).jumpTo > -1) {
        this.links.push({
          source: curr,
          target: (action as Inst).jumpTo.toString(),
          label: 'jump to'
        })
      }
      if (canRefer(action as Inst) && (action as Inst).referTo > -1) {
        node.label += ' ' + (action as Inst).referTo;
      }
    }

    if (parseInt(curr) > 0) {
      let prev = (parseInt(curr) - 1).toString();
      this.links.push({
        source: prev,
        target: curr,
        label: 'next'
      })
    }
  }

  add(action: Action) {
    let cnt = this.actions.length;
    let curr = cnt.toString();
    this.addWithoutPush(curr, action);
    if (isModule(action)) {
      this.actions.push({
        name: action.name,
        instructions: (action as Module).instructions
      })
    } else {
      this.actions.push({
        name: (action as Inst).name,
        color: (action as Inst).color,
        referTo: (action as Inst).referTo,
        jumpTo: (action as Inst).jumpTo
      });
    }
    this.updateAll();
  }

  updateAll(): void {
    this.center$.next(true);
    this.update$.next(true);
  }

  delete(): void {
    let idx = this.actions.length;
    if (idx > 0) {
      this.actions.pop();
      let curr = (idx - 1).toString();
      this.nodes = this.nodes.filter(e => e.id !== curr);
      this.links = this.links.filter(e => e.source !== curr && e.target !== curr)
      this.updateAll();
    }
  }

  initInfo() {
    let data = {
      input: '',
      memory: '',
      ok: false
    }
    const projDialog = this.dialog.open(InitDialog, {
      width: '300px',
      data: data
    });
    projDialog.afterClosed().subscribe(result => {
      if (data.input !== '' && data.memory !== '' && data.ok) {
        this.inputs = data.input.split(';')
        this.memory = data.memory.split(';')
      }
    })
  }
}

@Component({
  templateUrl: 'init-dialog.html',
})
export class InitDialog {
  constructor(
    public dialogRef: MatDialogRef<InitDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      input: string,
      memory: string,
      ok: boolean
    },
  ) { }

  ok() {
    this.data.ok = true;
  }
}