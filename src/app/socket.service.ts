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
  private first = true;

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
    if (this.appService.getUserInfoFromLocalStorage()) {
      let data = {
        authToken: this.appService.getUserInfoFromLocalStorage().authToken
      }
      this.socket.emit('set-user', data);
    }
  }

  public notifyUpdates(data) {
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

  public authErrorMultiple() {
    if (this.appService.getUserInfoFromLocalStorage() && this.first) {
      this.first = false;

      return Observable.create((observer) => {
        this.socket.on('auth-error@' + this.appService.getUserInfoFromLocalStorage().userId, (data) => {
          console.log(this.appService.getUserInfoFromLocalStorage().authToken);

          if (data.authToken != this.appService.getUserInfoFromLocalStorage().authToken)
            observer.next(data);
        });
      });
    } else {
      return null;
    }
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

  public updateIssue() {
    return Observable.create((observer) => {
      this.socket.on('issue@' + this.appService.getUserInfoFromLocalStorage().userId, (data) => {
        observer.next(data);
      });
    });
  }

  public updateIssues() {
    return Observable.create((observer) => {
      this.socket.on('issues@' + this.appService.getUserInfoFromLocalStorage().userId, () => {
        observer.next();
      });
    });
  }

  public updateIssuesAssigned() {
    return Observable.create((observer) => {
      this.socket.on('issues-assigned@' + this.appService.getUserInfoFromLocalStorage().userId, () => {
        observer.next();
      });
    });
  }

  public updateIssuesReported() {
    return Observable.create((observer) => {
      this.socket.on('issues-reported@' + this.appService.getUserInfoFromLocalStorage().userId, () => {
        observer.next();
      });
    });
  }

  public updateComments() {
    return Observable.create((observer) => {
      this.socket.on('comments@' + this.appService.getUserInfoFromLocalStorage().userId, (data) => {
        observer.next(data);
      });
    });
  }

  public updateWatchers() {
    return Observable.create((observer) => {
      this.socket.on('watchers@' + this.appService.getUserInfoFromLocalStorage().userId, (data) => {
        observer.next(data);
      });
    });
  }

  public updateWatchersCount() {
    return Observable.create((observer) => {
      this.socket.on('watchers-count@' + this.appService.getUserInfoFromLocalStorage().userId, (data) => {
        observer.next(data);
      });
    });
  }

  public updateNotifications() {
    return Observable.create((observer) => {
      this.socket.on('notifications@' + this.appService.getUserInfoFromLocalStorage().userId, () => {
        observer.next();
      });
    });
  }


  public exitSocket() {
    this.socket.disconnect();
    this.first = true;
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
