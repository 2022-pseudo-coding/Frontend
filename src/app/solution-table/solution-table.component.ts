import { Component, Input, OnInit } from '@angular/core';
import { Inst } from '../services/problem-backend.service';


export interface Solution {
  name: string,
  steps: number,
  numInst: number,
  insts: Inst[]
}

//todo

@Component({
  selector: 'app-solution-table',
  templateUrl: './solution-table.component.html',
  styleUrls: ['./solution-table.component.css']
})
export class SolutionTableComponent implements OnInit {

  @Input() solutions:Solution[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
