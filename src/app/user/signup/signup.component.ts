import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public firstName: string;
  public lastName: string;
  public mobileNumber: string;
  public email: string;
  public password: string;
  public countryCode: string = "";
  private phones;
  public codes;

  constructor(public appService: AppService, public router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    let userInfo = this.appService.getUserInfoFromLocalStorage();
    if (userInfo && userInfo.authToken && userInfo.userId)
      this.router.navigate(['/dashboard']);

    this.appService.getCountryCode().subscribe(
      (apiResponse) => {
        if (apiResponse) {
          this.phones = apiResponse;
          this.codes = Object.keys(this.phones);
        }
      },
      (err) => {
        console.error(err.error.message);
      });
  }

  public signup(): void {
    let countryCode = this.phones[this.countryCode.trim()];
    let data = {
      firstName: this.firstName,
      lastName: this.lastName,
      mobileNumber: this.mobileNumber,
      email: this.email,
      password: this.password,
      countryCode: countryCode
    }
    this.appService.signup(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.toastr.success(apiResponse.message);

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        }
        else {
          this.toastr.error(apiResponse.message);
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      });
  }

  public validateEmail(email: string): boolean {
    let patt = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (patt.test(email)) {
      return true;
    } else {
      return false;
    }
  }

  public validateMobile(mobileNumber: string): boolean {
    if (!this.countryCode || !mobileNumber)
      return false;
    else if (this.countryCode == 'IN') {
      let mobileNumberRegex = /^[6-9]\d{9}$/; /* 10 digits starts with 6-9 for India*/
      if (mobileNumber.toString().match(mobileNumberRegex)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  public validatePassword(password: string): boolean {
    let patt = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (patt.test(password)) {
      return true;
    } else {
      return false;
    }
  }

}
