import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './register/register.component';
import { UserCenterComponent } from './user-center/user-center.component';


const routes: Routes = [
  {
    path: 'world', children: [

      { path: '**', component: PageNotFoundComponent }
    ]
  },
  { path: '', redirectTo: '/world/camp', pathMatch: 'full' },
  { path: 'center', component: UserCenterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component:AdminComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
