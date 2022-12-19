import { Component, OnInit, Input, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { catchError, EMPTY } from 'rxjs';
import { DataService } from '../services/data.service';
import { ModProjService, Module, Project } from "../services/mod-proj.service";
import { Inst } from "../services/problem-backend.service";
import { Edge, Node } from '../coding/coding.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { canJump, canRefer } from '../coding/utils';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-selfproj',
  templateUrl: './selfproj.component.html',
  styleUrls: ['./selfproj.component.css'],

})

export class SelfprojComponent implements OnInit {

  modules: Module[] = [];
  projects: Project[] = [];
  curName: string = "";

  links: Edge[] = [];
  nodes: Node[] = [];

  update$: Subject<boolean> = new Subject();
  center$: Subject<boolean> = new Subject();

  windowSize: [number, number] = [window.innerWidth * 0.28, window.innerHeight * 0.8];
  curve = shape.curveNatural;

  constructor(private modProjService: ModProjService,
    private router: Router,
    private dataService: DataService,
    private dialog: MatDialog,
  ) {

  }

  ngOnInit(): void {
    if (!this.dataService.isLoggedIn) {
      this.router.navigate(['login']);
    }

    this.modProjService.getProjectsModules().pipe(catchError(err => {
      localStorage.clear();
      this.dataService.isLoggedIn.next(false);
      this.router.navigate(['login']);
      return EMPTY;
    })).subscribe(result => {
      this.modules = result.modules;
      this.projects = result.projects
    });

  }

  showModuleInst(m: Module) {
    this.curName = m.name;
    let j = 0;
    this.nodes = []
    this.links = []
    for (let inst of m.instructions) {
      let node: Node = {
        id: j.toString(),
        label: inst.name,
        color: inst.color,
        isSelected: false,
        isActive: false
      }
      this.nodes.push(node);

      if (canRefer(inst)) {
        node.label += ' ' + inst.referTo;
      }
      if (canJump(inst)) {
        this.links.push({
          source: j.toString(),
          target: inst.jumpTo.toString(),
          label: 'jump to'
        });
      }

      if (j > 0) {
        this.links.push({
          source: (j - 1).toString(),
          target: j.toString(),
          label: 'next'
        });
      }
      this.updateAll()
      j++;
    }
  }

  //TODO:
  showProjectInst(project: Project) {
    this.curName = project.title
    let j = 0;
    this.nodes = []
    this.links = []
    for (let action of project.actions) {
      
    }
  }

  newModule() {
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
        this.modProjService.createModule(data.name).pipe(catchError(err => {
          localStorage.clear();
          this.dataService.isLoggedIn.next(false);
          this.router.navigate(['login']);
          return EMPTY;
        })).subscribe(result => {
          this.dialog.open(DialogComponent, {
            width: '300px',
            data: { title: 'Message', message: result.message }
          });
          if (result.message.includes('success')) {
            this.router.navigate(["/coding/module"],
              {
                queryParams: {
                  name: result.name
                }
              })
          }
        });
      }
    })
  }

  toModule(m: Module) {
    this.router.navigate(["/coding/module"],
      {
        queryParams: {
          name: m.name
        }
      })
  }

  toProject(project: Project) {
    this.router.navigate(["/coding/project"],
      {
        queryParams: {
          id: project.id
        }
      })
  }

  newProject() {
    let data = {
      title: '',
      description: '',
      ok: false
    }
    const projDialog = this.dialog.open(ProjDialog, {
      width: '300px',
      data: data
    });
    projDialog.afterClosed().subscribe(result => {
      if (data.title !== '' && data.description !== '' && data.ok) {
        this.modProjService.createProject(data.title, data.description).pipe(catchError(err => {
          localStorage.clear();
          this.dataService.isLoggedIn.next(false);
          this.router.navigate(['login']);
          return EMPTY;
        })).subscribe(result => {
          this.dialog.open(DialogComponent, {
            width: '300px',
            data: { title: 'Message', message: result.message }
          });
          if (result.message.includes('success')) {
            this.router.navigate(["/coding/project"],
              {
                queryParams: {
                  id: result.id
                }
              })
          }
        });
      }
    })
  }

  updateAll(): void {
    this.update$.next(true);
    this.center$.next(true);
  }
}

@Component({
  templateUrl: 'proj-dialog.html',
})
export class ProjDialog {
  constructor(
    public dialogRef: MatDialogRef<ProjDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string,
      description: string,
      ok: boolean
    },
  ) { }

  ok() {
    this.data.ok = true;
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
