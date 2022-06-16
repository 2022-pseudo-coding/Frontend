import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, EMPTY } from 'rxjs';
import { DataService } from '../services/data.service';
import { MatDialog } from '@angular/material/dialog';


export interface Problem {
  position:number[],
  rotationY:number,
  ifUserDefined:boolean,
  name:string
}

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements OnInit {
  loaded: boolean = false;
  mapId!: string;
  mapSolved!:boolean;
  problems: Problem[] = [];
  position: number[] = [];
  instructions: string[] = [];

  constructor(private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.debug();
    let temp = this.route.snapshot.routeConfig?.path;
    this.mapId = temp ? temp : 'camp';
    this.getProblems();
  }

  debug(): void {
    localStorage.setItem('username', 'mike');
    localStorage.setItem('modelName', 'blueBot');
  }

  getProblems() {
    if(!localStorage.getItem('token')){
      this.router.navigate(['login']);
      return;
    }
    this.authService.mapProblems(this.mapId)
      .pipe(catchError(err => {
        localStorage.clear();
        this.dataService.isLoggedIn.next(false);
        this.router.navigate(['login']);
        return EMPTY;
      })).subscribe((result: any) => {
        this.mapSolved = result.mapSolved;
        this.instructions = result.instructions;
        for (let temp of result.problems){
          let worldInfo:string = temp.worldInfo;
          let numbers = worldInfo.split(';').map(Number);
          this.problems.push({
            position: [numbers[0], numbers[1], numbers[2]],
            rotationY: numbers[3],
            ifUserDefined: temp.ifUserDefined,
            name: temp.stage + '-' + temp.number
          });
        }
      });
  }

  setLoaded(loaded: boolean) {
    this.loaded = loaded;
  }

  setPosition(position:number[]){
    this.position = position;
  }

}
