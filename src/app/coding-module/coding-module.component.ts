import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { catchError, EMPTY } from 'rxjs';
import { DataService } from '../services/data.service';
import { Inst, Problem, ProblemBackendService, Status } from '../services/problem-backend.service'
import { canRefer, canJump, nodeToInst } from '../coding/utils'
import { DialogComponent } from '../dialog/dialog.component';
import { Edge, Node } from '../coding/coding.component';
import { ModProjService } from '../services/mod-proj.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-coding-module',
  templateUrl: './coding-module.component.html',
  styleUrls: ['./coding-module.component.css']
})
export class CodingModuleComponent implements OnInit {

  /*
     * graph chart config
    */
  windowSize: [number, number] = [window.innerWidth * 0.65, window.innerHeight * 0.46];
  curve = shape.curveNatural;

  /*
    * control panel
  */
  hasSubmitted: boolean = false;

  /*
    * all the lists
  */
  memory: string[] = [];

  /*
    * inst & prob
  */
  userInsts: Inst[] = [];
  selectedNode?: Node;
  prob!: Problem;

  /*
    * graph data
  */
  links: Edge[] = [
  ];
  nodes: Node[] = [
  ];
  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();

  constructor(private modProjService: ModProjService,
    private problemService: ProblemBackendService,
    private router: Router,
    private dataService: DataService,
    private dialog: MatDialog,
  ) {

  }

  ngOnInit(): void {
    this.problemService.getProblem('3', '4').pipe(catchError(err => {
      localStorage.clear();
      this.dataService.isLoggedIn.next(false);
      this.router.navigate(['login']);
      return EMPTY;
    })).subscribe(result => {
      this.prob = result.problem;
      this.memory = result.problem.memory.split(';');
      this.memory.forEach((el, i) => {
        this.memory[i] = '0';
      })
    });
  }

  submit(): void {
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
    let data = {
      name: '',
      ok: false
    }
    const modDialog = this.dialog.open(ModDialog, {
      width: '300px',
      data: data
    });
    modDialog.afterClosed().subscribe(result => {
      if (data.name !== '' && data.ok) {
        this.modProjService.createModule(data.name, this.userInsts).pipe(catchError(err => {
          localStorage.clear();
          this.dataService.isLoggedIn.next(false);
          this.router.navigate(['login']);
          return EMPTY;
        })).subscribe(result => {
          this.dialog.open(DialogComponent, {
            width: '300px',
            data: { title: 'Message', message: result.message }
          })
        });
      }

    })

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

@Component({
  templateUrl: 'mod-dialog.html',
})
export class ModDialog {
  constructor(
    public dialogRef: MatDialogRef<ModDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      name: string, ok: boolean
    },
  ) { }

  ok() {
    this.data.ok = true;
  }
}
