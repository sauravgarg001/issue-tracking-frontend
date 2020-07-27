import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private url = 'http://localhost:3000/api/v1/users';

  constructor(private http: HttpClient) { }

  private handleError(err: HttpErrorResponse) {
    return Observable.throw(err.message);
  }

  public signup(data): Observable<any> {
    const params = new HttpParams()
      .set('firstName', data.firstName)
      .set('lastName', data.lastName)
      .set('mobileNumber', data.mobileNumber)
      .set('email', data.email)
      .set('password', data.password)
      .set('countryCode', data.countryCode);

    return this.http.post(`${this.url}/signup`, params);
  }

  public login(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
      .set('password', data.password);

    return this.http.post(`${this.url}/login`, params);
  }

  public forgotPassword(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)

    return this.http.post(`${this.url}/forgot/password`, params);
  }

  public changePassword(data): Observable<any> {
    const params = new HttpParams()
      .set('email', data.email)
      .set('OTP', data.OTP)
      .set('newPassword', data.newPassword);

    return this.http.put(`${this.url}/change/password`, params);
  }

  public logout(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.getUserInfoFromLocalStorage().authToken)
    return this.http.post(`${this.url}/logout`, params);
  }

  public getUser(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.getUserInfoFromLocalStorage().authToken)

    return this.http.get(`${this.url}/`, { params: params });
  }

  public getUsers(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.getUserInfoFromLocalStorage().authToken)

    return this.http.get(`${this.url}/all`, { params: params });
  }

  public getUserInfoFromLocalStorage() {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  public setUserInfoInLocalStorage(data) {
    return localStorage.setItem('userInfo', JSON.stringify(data));
  }

  public removeUserInfoInLocalStorage() {
    localStorage.removeItem('userInfo');
  }

  public getCountryCode(): Observable<any> {
    return this.http.get(`http://localhost:3000/api/v1/phones`);
  }
}
