import { Component, OnInit } from '@angular/core';
import { ProblemService } from './problem.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.css']
})

export class ProblemComponent implements OnInit {

  constructor(public problemEmitService:ProblemService) { }

  ins = new Array<number>();

  inputList = new Array<string>();
  storageList = new Array<string>();
  outputList = new Array<string>();
  expectedOutputList = new Array<string>();
  availableInsList = new Array<number>();
  

  ngOnInit(): void {
    this.ins = [1];
    for(var i = 0 ; i<=24 ; i++)
    {
      this.storageList.push("A");
    }
    for(var i = 0 ; i<=5 ; i++)
    {
      this.inputList.push("1");
      this.outputList.push("1");
      this.expectedOutputList.push("1");
    }
    console.log(this.inputList);
  }

  addIns(x:number):void{
    this.problemEmitService.problemEventEmitter.emit({
      ins:"add",
      message:x,
    });
  }

}
