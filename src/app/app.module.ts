import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { LoginComponent } from './user/login/login.component';
import { AppService } from './app.service';
import { ToastrModule } from "ngx-toastr";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    UserModule,
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent, pathMatch: 'full' },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: '*', redirectTo: 'login' },
      { path: '**', redirectTo: 'login' }
    ]),
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot()
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
