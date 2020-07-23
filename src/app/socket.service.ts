import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { tap } from "rxjs/operators"
import { AppService } from 'src/app/app.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private baseUrl = 'http://localhost:3000';
  private socket;
  private userId;

  constructor(public http: HttpClient) {
    //handshake
    this.socket = io(this.baseUrl);

    let appService: AppService;
    this.userId = appService.getUserInfoFromLocalStorage().userId;
  }

  public verifyUser() {
    return Observable.create(
      (observer) => {
        this.socket.on('verifyUser',
          (data) => {
            observer.next(data);
          });
      });
  }

  public setUser() {
    let appService: AppService;
    let authToken = appService.getUserInfoFromLocalStorage().authToken;
    let data = {
      authToken: authToken
    }
    this.socket.emit('set-user', data);
  }

  public setUpdates(data) {
    data.userId = this.userId;
    let eventName = data.eventName;
    delete data.eventName;
    this.socket.emit(eventName, data);
  }

  public authError() {
    return Observable.create((observer) => {
      this.socket.on('auth-error@' + this.userId, (data) => {
        observer.next(data);
      });
    });
  }

  public disconnectedSocket() {
    return Observable.create(
      (observer) => {
        this.socket.on('disconnect',
          () => {
            observer.next();
          });
      });
  }

  public getUpdates() {
    return Observable.create((observer) => {
      this.socket.on('updates@' + this.userId, (data) => {
        observer.next(data);
      });
    });
  }

  public exitSocket() {
    this.socket.disconnect();
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof Error) {
      errorMessage = `An error occured: ${err.error.message}`;
    }
    else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.error.message}`;
    }
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  }
}
