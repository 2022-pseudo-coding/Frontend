import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';


@Component({
  selector: 'app-world',
  templateUrl: './world.component.html'
})
export class WorldComponent implements OnInit {

  constructor(private router:Router, private authService: AuthService) { }

  ngOnInit(): void {
    //TODO this part is commented for testing three.js
    //this.redirect();


  }

  redirect(): void{
    if(!localStorage.getItem('token')){
      this.router.navigate(['login']);
    }else{
      // refresh and may expire token
      this.authService.refresh()
      .pipe(catchError((error: HttpErrorResponse) => {
        this.router.navigate(['login']);
        return throwError(() => new Error('Something bad happened!'))
      }));
    }
  }

}
