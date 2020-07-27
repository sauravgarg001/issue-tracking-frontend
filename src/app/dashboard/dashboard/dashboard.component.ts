import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from 'src/app/socket.service';
import { IssueService } from '../issue.service';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [SocketService]
})
export class DashboardComponent implements OnInit {

  //Font Awesome Icons
  public faArrowUp = faArrowUp;
  public faArrowDown = faArrowDown;
  public issuesType = 'Assigned';
  public issues;
  public user;
  public sort = 'modifiedOn';

  constructor(public appService: AppService,
    public socketService: SocketService,
    public router: Router,
    private toastr: ToastrService,
    public issueService: IssueService) { }

  ngOnInit(): void {
    let userInfo = this.appService.getUserInfoFromLocalStorage();
    if (!userInfo || !userInfo.authToken || !userInfo.userId)
      this.router.navigate(['/login']);

    this.disconnectedSocket();
    this.authError();
    this.verifyUserConfirmation();

    let getUser = () => {
      return new Promise((resolve, reject) => {
        this.appService.getUser().subscribe(
          (apiResponse) => {
            console.log(apiResponse);
            if (apiResponse.status === 200) {
              this.user = apiResponse.data;
              resolve();
            }
            else {
              reject(apiResponse.message);
            }
          },
          (err) => {
            reject(err.error.message);
          });
      });
    }

    let getIssues = () => {
      return new Promise((resolve, reject) => {

        this.issueService.getIssuesAssigned({}).subscribe(
          (apiResponse) => {
            console.log(apiResponse);
            if (apiResponse.status === 200) {
              this.issues = apiResponse.data;
              resolve();
            }
            else {
              reject(apiResponse.message);
            }
          },
          (err) => {
            reject(err.error.message);
          }
        );
      });
    }

    getUser()
      .then(getIssues)
      .then(() => {
        console.info("Initialization Done");
      })
      .catch((errorMessage) => {
        this.toastr.error(errorMessage)
      });

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

  public toggleIssueType(): void {
    if (this.issuesType == 'Assigned') {
      this.issueService.getIssuesReported({}).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
            this.issuesType = 'Reported';
          }
          else {
            this.issues = null
            this.toastr.error(apiResponse.message);
          }
        },
        (err) => {
          this.issues = null
          this.toastr.error(err.error.message);
        }
      );
    } else {
      this.issueService.getIssuesAssigned({}).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
            this.issuesType = 'Assigned';
          }
          else {
            this.issues = null
            this.toastr.error(apiResponse.message);
          }
        },
        (err) => {
          this.issues = null
          this.toastr.error(err.error.message);
        }
      );
    }
  }
  public openIssue(issueId: string): void {
    this.router.navigate([`/issue/${issueId}`]);
  }
  public sortBy(sortBy: string): void {
    if (this.sort == sortBy) {
      this.sort = `-${this.sort}`;
    } else {
      this.sort = sortBy;
    }
    if (this.issuesType == 'Assigned') {
      this.issueService.getIssuesAssigned({ sort: this.sort }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
          }
          else {
            this.issues = null
            this.toastr.error(apiResponse.message);
          }
        },
        (err) => {
          this.issues = null
          this.toastr.error(err.error.message);
        }
      );
    } else {
      this.issueService.getIssuesReported({ sort: this.sort }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
          }
          else {
            this.issues = null
            this.toastr.error(apiResponse.message);
          }
        },
        (err) => {
          this.issues = null
          this.toastr.error(err.error.message);
        }
      );
    }
  }

}
