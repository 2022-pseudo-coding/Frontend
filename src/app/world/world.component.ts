import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry, throwError } from 'rxjs';
import { DataService } from '../services/data.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';


@Component({
  selector: 'app-world',
  templateUrl: './world.component.html'
})
export class WorldComponent implements OnInit {

  constructor(private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.redirect();
  }

  redirect(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['login']);
    } else {
      // refresh and may expire token
      this.authService.refresh()
        .pipe(catchError((error: HttpErrorResponse) => {
          localStorage.clear();
          this.dataService.isLoggedIn.next(false);

          this.router.navigate(['login']);
          return throwError(() => new Error('Something bad happened!'))
        })).subscribe((result: any) => {
        });
    }
  }

}
