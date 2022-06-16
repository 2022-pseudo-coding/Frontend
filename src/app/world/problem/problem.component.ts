import { Component, OnInit } from '@angular/core';
import { ProblemService } from './problem.service';
import { CommonModule } from '@angular/common';
import { Inst, ProblemBackendService, Status } from '../../services/problem-backend.service';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.css']
})

export class ProblemComponent implements OnInit {

  constructor(private problemService: ProblemService, private problemBackendService: ProblemBackendService) { }

  stage = "1";
  number = "1";
  ins = new Array<number>();

  title = "";
  description = "";

  inputList = new Array<string>();
  storageList = new Array<string>();
  outputList = new Array<string>();
  expectedOutputList = new Array<string>();
  availableInsList = new Array<number>();
  insNameList = ["inbox", "outbox", "copyfrom", "copyto", "add", "sub", "bump+", "bump-", "jump", "jump_zero", "jump_neg"];
  statusList = new Array<Status>();
  statusIndex = 0;
  currentStatus="no submit";

  ngOnInit(): void {
    this.availableInsList = [];
    this.getProblemInfo(this.stage,this.number);
    console.log(this.inputList);
    this.problemService.problemEventEmitter.subscribe((value: any) => {
      if (value.ins == "run") {
        this.solve(this.stage,this.number, value.insList);
      }
    });
  }

  addIns(x: number): void {
    this.problemService.problemEventEmitter.emit({
      ins: "add",
      message: x,
    });
  }

  getProblemInfo(stage: string, number: string) {
    this.problemBackendService.getProblem(stage, number)
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log(error);
        return throwError(() => new Error('cannot get problem info'))
      }))
      .subscribe(result => {
        this.title = result.problem.title;
        this.description = result.problem.description;
        let input = result.problem.input;
        let output = result.problem.output;
        let storage = result.problem.memory;
        let instruction = result.problem.instructions;

        this.inputList = input.split(";");
        this.expectedOutputList = output.split(";");
        this.storageList = storage.split(";");

        for (let i = 0; i < this.storageList.length; i++)this.storageList[i] = this.storageList[i + 1];
        this.storageList.pop();

        for (let i = 0; i < instruction.length; i++) {
          let insIndex = 0;
          switch (instruction[i].name) {
            case "inbox": insIndex = 0; break;
            case "outbox": insIndex = 1; break;
            case "copyfrom": insIndex = 2; break;
            case "copyto": insIndex = 3; break;
            case "add": insIndex = 4; break;
            case "sub": insIndex = 5; break;
            case "bump+": insIndex = 6; break;
            case "bump-": insIndex = 7; break;
            case "jump": insIndex = 8; break;
            case "jump_zero": insIndex = 9; break;
            case "jump_neg": insIndex = 10; break;
          }
          this.availableInsList.push(insIndex);
        }
      });
  }

  solve(stage: string, number: string, insList: Inst[]) {
    this.problemBackendService.sendSolution(stage, number, insList)
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log(error);
        return throwError(() => new Error('cannot get solution'))
      }))
      .subscribe(result => {
        this.statusList = result.statusList;
        this.currentStatus = result.message;
        console.log(result);
      });
  }
}


