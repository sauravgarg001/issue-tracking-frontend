import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/socket.service';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IssuesService } from '../issues.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  providers: [SocketService]
})
export class ListComponent implements OnInit {

  //Font Awesome Icons
  public faArrowUp = faArrowUp;
  public faArrowDown = faArrowDown;
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
    public issuesService: IssuesService) { }

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

          this.issuesService.getIssues({}).subscribe(
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

          this.issuesService.getIssuesCount({}).subscribe(
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
    console.log('getIssuesCount called');

    this.issuesService.getIssuesCount({ searchType: this.filterType, search: this.search }).subscribe(
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

  public openIssue(issueId: string): void {
    this.router.navigate([`/issue/${issueId}`]);
  }
  public sortBy(sortBy: string): void {
    if (this.sort == sortBy) {
      this.sort = `-${this.sort}`;
    } else {
      this.sort = sortBy;
    }

    this.issuesService.getIssues({ sort: this.sort, searchType: this.filterType, search: this.search }).subscribe(
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

  public filter(search): void {
    this.search = search;
    this.getIssuesCount();
    this.issuesService.getIssues({ sort: this.sort, searchType: this.filterType, search: this.search }).subscribe(
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

  public gotoPage(pageNumber: number): void {
    this.issuesService.getIssues({ sort: this.sort, searchType: this.filterType, search: this.search, skip: (pageNumber - 1) * 10 }).subscribe(
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

  public getUpdatedIssues(): void {
    this.socketService.updateIssues().subscribe(
      () => {
        this.gotoPage(this.page);
        this.getIssuesCount();
      });
  }

}
