import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Inst } from './problem-backend.service';

const baseUrl: string = environment.API_URL;

export interface Module {
  name: string,
  instructions: Inst[]
};

export interface Project {
  title: string,
  description: string,
  // todo
}

export interface ProjForwardResult {

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

  createProject() {

  }

  projectForward() {

  }

  getProjects() {

  }
}
