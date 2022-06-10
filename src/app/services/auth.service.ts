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


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post<LoginResult>(baseUrl + '/login', { username, password, type: 'user' });
  }

  register(username: string, password: string, modelName: string) {
    return this.http.post<RegisterResult>(baseUrl + '/register', { username, password, modelName });
  }

  refresh() {
    return this.http.get(baseUrl + '/refresh');
  }

  center(token: string) {
    return this.http.post<CenterResult>(baseUrl + '/center', { token });
  }

  changePassword(password: string, rePassword: string, token: string) {
    return this.http.post<ChangeResult>(baseUrl + '/changePassword', { password, rePassword, token });
  }
}
