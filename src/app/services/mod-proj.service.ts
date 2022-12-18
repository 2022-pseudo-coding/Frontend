import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Inst, Status } from './problem-backend.service';

const baseUrl: string = environment.API_URL;

export interface Action {
}

export interface Module extends Action {
  name: string,
  instructions: Inst[]
};

export interface Project {
  title: string,
  description: string,
  actions: Action[]
}

interface ProjForwardResult {
  statusList: Status[]
}

interface SimpleMsgResult {
  message: string
}

interface ModulesResult {
  modules: Module[],
  message: string
}

interface ProjectsResult {
  message: string,
  projects: Project[]
}

interface ProjectResult {
  message: string,
  project: Project
}

@Injectable({
  providedIn: 'root'
})
export class ModProjService {

  constructor(private http: HttpClient) { }

  createModule(name: string, instructions: Inst[]) {
    let token: string = localStorage.getItem('token')!
    let color = 'whatever'
    return this.http.post<SimpleMsgResult>(baseUrl + '/userDefineModule', {
      token, color, name, instructions
    })
  }

  getModules(name: string) {
    let token: string = localStorage.getItem('token')!;
    return this.http.post<ModulesResult>(baseUrl + '/module', {
      token, name
    })
  }

  //TODO:
  createProject(actions:Action[], title:string, description:string) {
    let token: string = localStorage.getItem('token')!;
    return this.http.post<SimpleMsgResult>(baseUrl + '/projectCreate', {
      token, title, description, actions
    })
  }

  projectForward(id:number, input:string[], memory:string[], instructions:Inst[]) {
    return this.http.post<ProjForwardResult>(baseUrl + '/solveProject', {
      id, input, memory, instructions
    })
  }

  getProjects() {
    let token: string = localStorage.getItem('token')!;
    return this.http.post<ProjectsResult>(baseUrl + '/projectByUser', {
      token
    })
  }

  getProjectById(id: number) {
    let token: string = localStorage.getItem('token')!;
    return this.http.post<ProjectResult>(baseUrl + '/projectById', {
      token, id
    })
  }

  updateProjects() {

  }
}
