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
import { Edge, Node } from '../coding/coding.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project, Action, Module, ModProjService } from '../services/mod-proj.service';

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
  state: string = 'unsubmitted'
  statusList: Status[] = [];
  statusPtr: number = -1;

  /*
    * all the lists
  */
  memory: string[] = [];
  inputs: string[] = [];
  outputs: string[] = [];
  hand: string = 'Nothing';

  /*
    * inst & prob
  */
  userInsts: Inst[] = [];
  actions:Action[] = [];
  selectedNode?: Node;
  prob!: Problem;
  project!: Project;

  /*
    * graph data
  */
  links: Edge[] = [
  ];
  nodes: Node[] = [
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
      this.inputs = result.problem.input.split(';');
      this.memory = result.problem.memory.split(';');
      this.memory.forEach((el, i) => {
        this.memory[i] = '0';
      });
      this.modProjService.getProjectById(this.route.snapshot.queryParamMap.get('id')!).subscribe(result => {
        this.project = result.project;
        this.actions = this.project.actions;
      })
    });

  }

  update(): void {
    for (let inst of this.userInsts) {
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
    this.modProjService.updateProject(this.project.id, this.actions).subscribe(result => {
      this.dialog.open(DialogComponent, {
        width: '300px',
        data: { title: 'Message', message: result.message }
      });
    })
  }

  play(): void {
    this.refresh();
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
    this.nodes.forEach((node, index) => {
      if (index === status.instIndex) {
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
    this.inputs = this.prob.input.split(';');
    this.memory = this.prob.memory.split(';');
    this.hand = 'Nothing';
    this.outputs = [];
    this.nodes.forEach((el, index) => {
      el.isActive = false
    });
    this.statusPtr = -1;
  }

  select(node: Node): void {
    // handle jump
    if (this.selectedNode) {
      if (node === this.selectedNode) {
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
      isSelected: false,
      isActive: false
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