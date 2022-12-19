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
  actions: Action[],
  id: number
}

interface ProjForwardResult {
  statusList: Status[]
}

interface SimpleMsgResult {
  message: string,
  id: number,
  name: string
}

interface ProjectsModulesResult {
  message: string,
  projects: Project[],
  modules: Module[]
}

interface ProjectResult {
  message: string,
  project: Project,
}

interface ModuleResult {
  message: string,
  module: Module
}

@Injectable({
  providedIn: 'root'
})
export class ModProjService {

  constructor(private http: HttpClient) { }

  createModule(name: string) {
    let token: string = localStorage.getItem('token')!
    let color = 'whatever'
    return this.http.post<SimpleMsgResult>(baseUrl + '/module/create', {
      token, color, name
    })
  }

  updateModule(name: string, instructions: Inst[]) {
    let token: string = localStorage.getItem('token')!
    return this.http.post<SimpleMsgResult>(baseUrl + '/module/update', {
      token, name, instructions
    })
  }

  getModule(name: string) {
    let token: string = localStorage.getItem('token')!
    return this.http.post<ModuleResult>(baseUrl + '/module/name', {
      token, name
    })
  }

  createProject(title: string, description: string) {
    let token: string = localStorage.getItem('token')!;
    return this.http.post<SimpleMsgResult>(baseUrl + '/project/create', {
      token, title, description
    })
  }

  updateProject(id: number, actions: Action[]) {
    let token: string = localStorage.getItem('token')!;
    return this.http.post<SimpleMsgResult>(baseUrl + '/project/update', {
      token, id, actions
    })
  }

  projectForward(id: number, input: string[], memory: string[], instructions: Inst[]) {
    return this.http.post<ProjForwardResult>(baseUrl + '/project/solve', {
      id, input, memory, instructions
    })
  }

  getProjectsModules() {
    let token: string = localStorage.getItem('token')!;
    return this.http.post<ProjectsModulesResult>(baseUrl + '/project/user', {
      token
    })
  }

  getProjectById(id: string) {
    let token: string = localStorage.getItem('token')!;
    return this.http.post<ProjectResult>(baseUrl + '/project/id', {
      token, id
    })
  }
}
