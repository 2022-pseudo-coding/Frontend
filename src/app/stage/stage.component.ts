import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { catchError, throwError } from 'rxjs';
import { StageService } from '../services/stage.service';
import { threadId } from 'worker_threads';
@Component({
  selector: 'app-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.css']
})
export class StageComponent implements OnInit {

  constructor( private router: Router,private stageService:StageService) { }
   stagelist:any=[[],[],[]]
  ngOnInit(): void {
    //GET关卡题目
   this.stageService.getQuestion(this.stagelist.stage.problem)
  }
  enter(stage:number,problem:number){
  // POST
  this.stageService.enterQuestion(this.stagelist.stage.problem,this.stagelist.stage)
    .pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => new Error('Something bad happened!'))
    }))
    .subscribe(result => {
    this.router.navigate(["/stage"])
      queryParams:{
        stage:this.stagelist.stage;
        problem:this.stagelist.problem
      }
    
     })
    
  }
}
