import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
const baseUrl: string = environment.API_URL;

interface Question {
 stage:string,
 number:string
}
interface enterQuestion {
  stage:string,
  number:string
 }
export class StageService {

  constructor(private http: HttpClient) { }
  //获取关卡下的问题
  getQuestion(stage: string) {
    return this.http.get<Question>(baseUrl + '/stage', 
    );}
  //跳转到关卡下题目的页面
   enterQuestion(stage: string, number: string) {
    return this.http.post<enterQuestion>(baseUrl + '/question', {
      stage, number
    });

}}
