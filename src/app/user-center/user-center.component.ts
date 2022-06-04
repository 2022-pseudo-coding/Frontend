import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { DataService } from '../services/data.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';


@Component({
  selector: 'app-user-center',
  templateUrl: './user-center.component.html',
  styleUrls: ['./user-center.component.css']
})
export class UserCenterComponent implements OnInit {
  username: string = "123";
  modelName: string = "blueBot";
  passwordHide: boolean = true;
  //todo render solutions
  solutions: any[] = [{}, {}, {}];

  form: FormGroup;
  newPassword = new FormControl('', [Validators.required, Validators.minLength(6)]);
  oldPassword = new FormControl('', [Validators.required]);


  constructor(private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog) {
    this.form = this.formBuilder.group({
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    });
  }

  ngOnInit(): void {
    //todo
    // this.getInfo();
  }

  getInfo(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['login']);
    } else {
      // refresh and may expire token
      this.authService.center(localStorage.getItem('token')!)
        .pipe(catchError(err => {
          localStorage.clear();
          this.dataService.isLoggedIn.next(false);
          this.router.navigate(['login']);
          return EMPTY;
        })).subscribe(result => {
          this.solutions = result.solutions;
          this.username = result.username;
          this.modelName = result.modelName;
        });
    }
  }

  getOldPasswordErrorMsg() {
    return 'You must enter your password!';
  }

  getNewPasswordErrorMsg() {
    if (this.newPassword?.hasError('required')) {
      return 'You must enter your password!';
    }
    return this.newPassword?.hasError('minlength') ? 'Your password must contain at least 6 characters' : '';
  }

  onSubmit() {
    if (this.form.valid) {
      this.authService.changePassword(this.oldPassword.value, this.newPassword.value, localStorage.getItem('token')!)
        .pipe(catchError(err => {
          localStorage.clear();
          this.dataService.isLoggedIn.next(false);
          this.router.navigate(['login']);
          return EMPTY;
        })).subscribe(result => {
          if (result.message === 'success') {
            this.openDialog('Congratulations', 'You have successfully changed your password!');
          } else {
            this.openDialog('Whoops', result.message);
          }
        });
    }

  }

  openDialog(title: string, message: string): void {
    console.log(title, message);
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '300px',
      data: { title: title, message: message }
    });
    dialogRef.afterClosed().subscribe(res => {
      window.location.reload();
    });
  }
}
