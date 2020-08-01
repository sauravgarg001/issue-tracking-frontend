import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { AppService } from '../app.service';
import { SocketService } from '../socket.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  public pathname: string;
  public faBell = faBell;
  public notifications;

  constructor(private router: Router,
    public appService: AppService,
    public socketService: SocketService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.disconnectedSocket();
    this.authError();
    this.verifyUserConfirmation();
    this.router.events.subscribe((ev) => {//subscribed to event called when a route is changes
      if (ev instanceof NavigationEnd) {
        this.pathname = ev.url;

        if (this.pathname == '/login' || this.pathname == '/signup') {
          this.notifications = null;
        } else {
          this.authErrorMultiple();
          let userInfo = this.appService.getUserInfoFromLocalStorage();
          if (!userInfo || !userInfo.authToken || !userInfo.userId) {
            this.logout('');
          }
          else {
            let getNotifications = () => {
              return new Promise((resolve, reject) => {

                this.appService.getUnreadNotifications().subscribe(
                  (apiResponse) => {
                    console.log(apiResponse);
                    if (apiResponse.status === 200) {
                      this.notifications = apiResponse.data;
                      resolve();
                    }
                    else {
                      reject(apiResponse.message);
                    }
                  },
                  (err) => {
                    if (err.error.status == 404) {
                      resolve();
                    } else {
                      reject(err.error.message);
                    }
                  }
                );
              });
            }

            getNotifications()
              .then(() => {
                this.getUpdatedNotifications();
                console.info("Navbar Initialization Done");
              })
              .catch((errorMessage) => {
                this.toastr.error(errorMessage);
                this.logout('');
              });
          }
        }
      }
    });
  }

  public markAllRead(): void {
    if (this.notifications) {
      this.appService.markAllNotificationsAsRead().subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.toastr.success(apiResponse.message);
            this.notifications = null;
          }
          else {
            this.toastr.error(apiResponse.message);
          }
        },
        (err) => {
          this.toastr.error(err.error.message);
        }
      );
    }
  }

  public verifyUserConfirmation(): any {
    this.socketService.verifyUser().subscribe(
      () => {
        this.socketService.setUser();
      });
  }

  public authError(): any {
    this.socketService.authError().subscribe(
      (data) => {
        setTimeout(() => {
          this.logout(data.error);
        }, 200)
      });

  }

  public authErrorMultiple(): void {
    let event = this.socketService.authErrorMultiple();
    if (event) {
      event.subscribe(
        (data) => {
          setTimeout(() => {
            this.logout(data.error);
          }, 200)
        });
    }
  }

  public disconnectedSocket(): any {
    this.socketService.disconnectedSocket().subscribe(
      () => {
        //        this.router.navigate(['/login']);
      });
  }

  public logout(err) {
    this.socketService.exitSocket();
    this.appService.logout().subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        this.toastr.success(err || apiResponse.message);
        this.appService.removeUserInfoInLocalStorage();
        this.router.navigate(['/login']);
      },
      (err) => {
        this.toastr.error(err || err.error.message);
        this.appService.removeUserInfoInLocalStorage();
        this.router.navigate(['/login']);
      });
  }


  public getUpdatedNotifications(): void {
    this.socketService.updateNotifications().subscribe(
      () => {
        this.appService.getUnreadNotifications().subscribe(
          (apiResponse) => {
            console.log(apiResponse);
            if (apiResponse.status === 200) {
              this.notifications = apiResponse.data;
              this.toastr.info('New notification arrived');
            }
            else {
              this.toastr.error(apiResponse.message);
            }
          },
          (err) => {
            this.toastr.error(err.error.message);
          }
        );
      });
  }

}
