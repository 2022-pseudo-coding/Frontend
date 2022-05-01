import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  username:string = localStorage.getItem('username') as string;
  isLoggedIn:boolean;

  constructor(private router:Router, private location: Location, private dataService:DataService) {
    this.dataService.isLoggedIn.subscribe(val => {
      this.isLoggedIn = val;
      this.username = localStorage.getItem('username') as string;
    });

    if(localStorage.getItem('token')){
      this.isLoggedIn = true;
    }else{
      this.isLoggedIn = false;
    }
  }

  ngOnInit(): void {
  }

  logout(): void{
    localStorage.clear();
    this.isLoggedIn = false;
    this.router.navigate(['login']);
  }
}
