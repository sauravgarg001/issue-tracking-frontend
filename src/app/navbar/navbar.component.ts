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
    this.router.events.subscribe((ev) => {//subscribed to event called when a route is changes
      if (ev instanceof NavigationEnd) {
        this.pathname = ev.url;

        if (this.pathname == '/login' || this.pathname == '/signup') {
          this.notifications = null;
        } else {
          this.disconnectedSocket();
          this.authError();
          this.verifyUserConfirmation();

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
              console.info("Navbar Initialization Done");
            })
            .catch((errorMessage) => {
              this.toastr.error(errorMessage)
            });
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

  public disconnectedSocket(): any {
    this.socketService.disconnectedSocket().subscribe(
      () => {
        // location.reload();
      });
  }

  public logout(err) {
    this.socketService.exitSocket();
    this.appService.logout().subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.toastr.success(err || apiResponse.message);
        }
        else {
          this.toastr.error(err || apiResponse.message);
        }
      },
      (err) => {
        this.toastr.error(err || err.error.message);
      });
    this.appService.removeUserInfoInLocalStorage();
    this.router.navigate(['/login']);
  }

}
