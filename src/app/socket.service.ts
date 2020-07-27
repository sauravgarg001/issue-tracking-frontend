import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { tap } from "rxjs/operators"
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private baseUrl = 'http://localhost:3000';
  private socket;

  constructor(public http: HttpClient, public appService: AppService) {
    //handshake
    this.socket = io(this.baseUrl);
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
    let data = {
      authToken: this.appService.getUserInfoFromLocalStorage().authToken
    }
    this.socket.emit('set-user', data);
  }

  public setUpdates(data) {
    data.userId = this.appService.getUserInfoFromLocalStorage().userId;
    let eventName = data.eventName;
    delete data.eventName;
    this.socket.emit(eventName, data);
  }

  public authError() {
    return Observable.create((observer) => {
      this.socket.on('auth-error', (data) => {
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
      this.socket.on('updates@' + this.appService.getUserInfoFromLocalStorage().userId, (data) => {
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
