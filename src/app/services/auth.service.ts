import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';


const baseUrl:string = 'http://localhost:8080'

interface RegisterResult{
  id: number,
  message: string
}

interface LoginResult{
  role: string,
  token: string,
  message: string
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post<LoginResult>(baseUrl + '/login', {username, password, type: 'user'});
  }

  register(username: string, password: string){
    return this.http.post<RegisterResult>(baseUrl + '/register', {username, password});
  }

  refresh(){
    return this.http.post(baseUrl + '/refresh', {});
  }
}
