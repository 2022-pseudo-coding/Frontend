import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularMaterialModule } from './angular-material.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxGraphModule } from '@swimlane/ngx-graph';

/* Project Components */
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NavComponent } from './nav/nav.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DialogComponent } from './dialog/dialog.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { DataService } from './services/data.service';
import { environment } from 'src/environments/environment';
import { ProblemBackendService } from './services/problem-backend.service';
import { UserCenterComponent } from './user-center/user-center.component';
import { CraftComponent } from './craft/craft.component';
import { SolutionTableComponent } from './solution-table/solution-table.component';
import { ManualComponent } from './manual/manual.component';
import { TableDialogComponent } from './table-dialog/table-dialog.component';
import { AdminComponent } from './admin/admin.component';
import { CodingComponent } from './coding/coding.component';
import { CodingModuleComponent, } from './coding-module/coding-module.component';
import { CodingProjectComponent, InitDialog } from './coding-project/coding-project.component';
import { ModProjService } from './services/mod-proj.service';
import { SelfprojComponent, ProjDialog, ModDialog } from "./selfproj/selfproj.component";
import { StageComponent } from './stage/stage.component';
import { StageService } from './services/stage.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavComponent,
    PageNotFoundComponent,
    DialogComponent,
    UserCenterComponent,
    CraftComponent,
    SolutionTableComponent,
    CodingComponent,
    ManualComponent,
    TableDialogComponent,
    AdminComponent,
    CodingModuleComponent,
    CodingProjectComponent,
    ModDialog,
    ProjDialog,
    SelfprojComponent,
    StageComponent,
    InitDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule,
    NgxGraphModule,
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }, DataService, ProblemBackendService, ModProjService, StageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
