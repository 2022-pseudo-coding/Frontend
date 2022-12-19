import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Problem, Solution } from './problem-backend.service';
const baseUrl: string = environment.API_URL;

export interface Stage {
  name: string,
  problems: Problem[]
}

interface StagesResult {
  stages: Stage[],
  mySolutions: Solution[]
}


@Injectable({
  providedIn: 'root'
})
export class StageService {

  constructor(private http: HttpClient) { }
  //获取关卡下的问题
  getAllQuestions() {
    let token = localStorage.getItem('token')!;
    return this.http.post<StagesResult>(baseUrl + '/stages', {
      token
    }
    );
  }

}
