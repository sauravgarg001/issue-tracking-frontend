import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [SignupComponent, LoginComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: 'signup', component: SignupComponent }
    ]),
    FormsModule
  ]
})
export class UserModule { }
