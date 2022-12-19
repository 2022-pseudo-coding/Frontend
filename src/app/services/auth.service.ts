import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const baseUrl: string = environment.API_URL;

interface RegisterResult {
  id: number,
  message: string
}

interface ChangeResult {
  message: string
}

interface CenterResult {
  username: string,
  modelName: string,
  message: string,
  solutions: any[]
}

interface LoginResult {
  role: string,
  token: string,
  message: string,
  modelName: string
}

interface UserDefineResult {
  message: string,
  name: string
}

interface MapProblemsResult {
  problems: any[]
}

interface AdminCenterResult{
  userCount: number,
  solutionMap: any
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post<LoginResult>(baseUrl + '/login', {
      username,
      password,
      type: username === 'admin' ? 'admin' : 'user'
    });
  }

  register(username: string, password: string) {
    return this.http.post<RegisterResult>(baseUrl + '/register', { username, password });
  }

  center() {
    let token: string = localStorage.getItem('token')!;
    return this.http.post<CenterResult>(baseUrl + '/center', { token });
  }

  changePassword(password: string, rePassword: string, token: string) {
    return this.http.post<ChangeResult>(baseUrl + '/changePassword', { password, rePassword, token });
  }

  adminCenter(){
    return this.http.get<AdminCenterResult>(baseUrl + '/admin/center');
  }

  userDefine(problem: any) {
    let token = localStorage.getItem('token')!;
    let input = problem.input.split('').join(';');
    let output = problem.output.split('').join(';');
    let instructions = problem.instructions.join(';');
    let worldInfo = problem.worldInfo.join(';') + ';0';
    let title = problem.title;
    let description = problem.description;
    let stage = 4;

    let temp = problem.memory.split('');
    let memory = temp.length + ';' + temp.join(';');

    return this.http.post<UserDefineResult>(baseUrl + '/userDefine', {
      token, stage, title, description, input, output, instructions, memory, worldInfo
    })
  }
}
