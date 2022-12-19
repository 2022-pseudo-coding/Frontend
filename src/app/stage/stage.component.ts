import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { catchError, throwError } from 'rxjs';
import { Stage, StageService } from '../services/stage.service';
import { Problem } from '../services/problem-backend.service';
import { TableDialogComponent } from '../table-dialog/table-dialog.component';

@Component({
  selector: 'app-stage',
  templateUrl: './stage.component.html',
  styleUrls: ['./stage.component.css']
})
export class StageComponent implements OnInit {

  stagelist: Stage[] = []

  constructor(private router: Router,
    private stageService: StageService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    //GET关卡题目
    this.stageService.getAllQuestions().subscribe(result => {
      this.stagelist = result.stages
      for (let solution of result.mySolutions) {
        this.stagelist[solution.stage - 1].problems[solution.number - 1].solved = true
      }
    })
  }

  enter(stage: number, problem: number) {
    this.router.navigate(["/coding/problem"],
      {
        queryParams: {
          stage: stage,
          problem: problem
        }
      })
  }

  history(problem: Problem) {
    this.dialog.open(TableDialogComponent, {
      width: '300px',
      data: {
        title: 'Solutions of ' + problem.title,
        message: 'This problem has not been solved yet.',
        hasSolutions: problem.solutions.length !== 0,
        solutions: problem.solutions
      },

    });
  }
}
