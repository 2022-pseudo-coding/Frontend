import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularMaterialModule } from './angular-material.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/* Project Components */
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NavComponent } from './nav/nav.component';
import { WorldComponent } from './world/world.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DialogComponent } from './dialog/dialog.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { DataService } from './services/data.service';
import { RendererWorldComponent } from './world/renderer-world.component';
import { RendererProblemComponent } from './world/problem/renderer-problem.component';
import { AbstractObjectDirective } from './world/basics/abstract-object.directive';
import { SceneDirective } from './world/basics/scene.directive';
import { ProblemComponent } from './world/problem/problem.component';
import { LightDirective } from './world/basics/light.directive';
import { BallDirective } from './world/mesh/ball.directive';
import { GroundDirective } from './world/mesh/ground.directive';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavComponent,
    WorldComponent,
    PageNotFoundComponent,
    DialogComponent,
    RendererWorldComponent,
    RendererProblemComponent,
    AbstractObjectDirective,
    SceneDirective,
    ProblemComponent,
    LightDirective,
    BallDirective,
    GroundDirective,
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }, DataService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
