import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { catchError, EMPTY } from 'rxjs';
import { DataService } from '../services/data.service';
import { ModProjService, Module} from "../services/mod-proj.service";
import { Inst} from "../services/problem-backend.service";
import { Edge, Node } from '../coding/coding.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-selfproj',
  templateUrl: './selfproj.component.html',
  styleUrls: ['./selfproj.component.css']
})



export class SelfprojComponent implements OnInit {

  module:Module[] = [];
  insts: Inst[] = [];
  curName: string = "";

  links: Edge[] = [];
  nodes: Node[] = [];


  windowSize: [number, number] = [window.innerWidth * 0.65, window.innerHeight * 0.46];
  curve = shape.curveNatural;

  constructor(private modProjService: ModProjService,
              private router:Router,
              private dataService:DataService,
              private dialog: MatDialog,
  ) {

  }

  ngOnInit(): void {
    if(!this.dataService.isLoggedIn){
      this.router.navigate(['login']);
    }

    this.modProjService.getModules(localStorage.getItem('username')!).pipe(catchError(err =>{
      localStorage.clear();
      this.dataService.isLoggedIn.next(false);
      this.router.navigate(['login']);
      return EMPTY;
    })).subscribe(result =>{
      this.module = result.modules;

    });

  }

  showInst(m:Module){
    this.insts = m.instructions;
    this.curName = m.name;
    let j = 0;
    this.nodes = []
    this.links = []
    for(let inst of this.insts){
      this.nodes.push({
        id: j.toString(),
        label: inst.name,
        color: inst.color,
        isSelected: false,
        isActive: false
      });

      this.links.push({
        source: j.toString(),
        target: inst.referTo.toString(),
        label: 'next'
        }
      );

      if(inst.jumpTo >= 0){
        this.links.push({
            source: j.toString(),
            target: inst.jumpTo.toString(),
            label: 'jump to'
          }
        );
      }

    }
  }

}
