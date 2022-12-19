import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './register/register.component';
import { UserCenterComponent } from './user-center/user-center.component';
import { CodingComponent } from './coding/coding.component';
import { CodingModuleComponent } from './coding-module/coding-module.component';
import { CodingProjectComponent } from './coding-project/coding-project.component';
import { SelfprojComponent } from "./selfproj/selfproj.component";
import { StageComponent } from './stage/stage.component';

const routes: Routes = [
  { path: '', redirectTo: '/problems', pathMatch: 'full' },
  { path: 'coding/problem', component: CodingComponent },
  { path: 'coding/module', component: CodingModuleComponent },
  { path: 'coding/project', component: CodingProjectComponent },
  { path: 'center', component: UserCenterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'problems', component: StageComponent },
  { path: 'projects', component: SelfprojComponent },
  { path: '**', component: PageNotFoundComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
