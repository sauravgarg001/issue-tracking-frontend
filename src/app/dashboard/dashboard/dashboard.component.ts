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
  public filterType = 'title';
  public sort = 'modifiedOn';
  public search = '';
  public page = 1;
  public totalIssues;
  public totalPages;

  constructor(public appService: AppService,
    public socketService: SocketService,
    public router: Router,
    private toastr: ToastrService,
    public issueService: IssueService) { }

  public counter(i): Array<number> {
    return Array.from({ length: i }, (x, i) => i + 1);
  }

  ngOnInit(): void {
    let userInfo = this.appService.getUserInfoFromLocalStorage();
    if (!userInfo || !userInfo.authToken || !userInfo.userId)
      this.router.navigate(['/login']);
    else {
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

      let getIssuesCount = () => {
        return new Promise((resolve, reject) => {

          this.issueService.getIssuesAssignedCount({}).subscribe(
            (apiResponse) => {
              console.log(apiResponse);
              if (apiResponse.status === 200) {
                this.totalIssues = apiResponse.data;
                this.totalPages = Math.ceil(this.totalIssues / 10);
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
        .then(getIssuesCount)
        .then(() => {
          this.getUpdatedIssues();
          console.info("Initialization Done");
        })
        .catch((errorMessage) => {
          this.toastr.error(errorMessage)
        });
    }
  }

  private getIssuesCount(): void {
    if (this.issuesType == 'Assigned') {
      this.issueService.getIssuesAssignedCount({ searchType: this.filterType, search: this.search }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.totalIssues = apiResponse.data;
            this.totalPages = Math.ceil(this.totalIssues / 10);
          }
          else {
            this.toastr.error(apiResponse.message);
          }
        },
        (err) => {
          this.toastr.error(err.error.message);
        }
      );
    } else {
      this.issueService.getIssuesReportedCount({ searchType: this.filterType, search: this.search }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.totalIssues = apiResponse.data;
            this.totalPages = Math.ceil(this.totalIssues / 10);
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

  public toggleIssueType(issueType): void {
    if (issueType == 'Reported') {
      this.issueService.getIssuesReported({ searchType: this.filterType, search: this.search }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
            this.issuesType = 'Reported';
            this.sort = 'modifiedOn';
            this.page = 1;
            this.getIssuesCount();
          }
          else {
            this.issues = null
            this.toastr.error(apiResponse.message);
          }
        },
        (err) => {
          this.issues = null
          this.toastr.error(err.error.message);
          this.issuesType = 'Reported';
          this.getIssuesCount();
        }
      );
    } else {
      this.issueService.getIssuesAssigned({ searchType: this.filterType, search: this.search }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
            this.issuesType = 'Assigned';
            this.sort = 'modifiedOn';
            this.page = 1;
            this.getIssuesCount();
          }
          else {
            this.issues = null
            this.toastr.error(apiResponse.message);
          }
        },
        (err) => {
          this.issues = null
          this.toastr.error(err.error.message);
          this.issuesType = 'Assigned';
          this.getIssuesCount();
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
      this.issueService.getIssuesAssigned({ sort: this.sort, searchType: this.filterType, search: this.search }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
            this.page = 1;
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
      this.issueService.getIssuesReported({ sort: this.sort, searchType: this.filterType, search: this.search }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
            this.page = 1;
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

  public filter(search): void {
    this.search = search;
    this.getIssuesCount();
    if (this.issuesType == 'Assigned') {
      this.issueService.getIssuesAssigned({ sort: this.sort, searchType: this.filterType, search: this.search }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
            this.page = 1;
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
      this.issueService.getIssuesReported({ sort: this.sort, searchType: this.filterType, search: this.search }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
            this.page = 1;
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

  public gotoPage(pageNumber: number): void {
    if (this.issuesType == 'Assigned') {
      this.issueService.getIssuesAssigned({ sort: this.sort, searchType: this.filterType, search: this.search, skip: (pageNumber - 1) * 10 }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
            this.page = pageNumber;
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
      this.issueService.getIssuesReported({ sort: this.sort, searchType: this.filterType, search: this.search, skip: (pageNumber - 1) * 10 }).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issues = apiResponse.data;
            this.page = pageNumber;
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

  public getUpdatedIssues(): void {
    this.socketService.updateIssuesAssigned().subscribe(
      () => {
        if (this.issuesType == 'Assigned') {
          this.gotoPage(this.page);
          this.getIssuesCount();
        }
      });
    this.socketService.updateIssuesReported().subscribe(
      () => {
        if (this.issuesType == 'Reported') {
          this.gotoPage(this.page);
          this.getIssuesCount();
        }
      });
  }

}
