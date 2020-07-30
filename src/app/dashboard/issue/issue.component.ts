import { Component, OnInit } from '@angular/core';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from 'src/app/socket.service';
import { IssueService } from '../issue.service';


@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css'],
  providers: [SocketService]
})
export class IssueComponent implements OnInit {

  //Font Awesome Icons
  public faTimes = faTimes;
  public faPlus = faPlus;
  public add: boolean = false;
  public issue = {
    issueId: '',
    title: '',
    status: '',
    description: '',
    reporter: {
      email: '',
      firstName: '',
      lastName: ''
    },
    modifiedOn: '',
    createdOn: '',
    watchersCount: -1,
    assignees: Array(),
    comments: Array(),
    watchers: Array()
  };
  private oldIssue;
  public user;
  public users;
  public nonAssignees;
  public assignee: string;
  public comment: string;
  public canUpdate: boolean = false;

  constructor(private _route: ActivatedRoute,
    public appService: AppService,
    public socketService: SocketService,
    public router: Router,
    private toastr: ToastrService,
    public issueService: IssueService) { }


  ngOnInit(): void {
    this.disconnectedSocket();
    this.authError();
    this.verifyUserConfirmation();
    if (this._route.snapshot.paramMap.get('issueId').toLowerCase() == 'add') {
      this.add = true;
    } else {
      this.issue.issueId = this._route.snapshot.paramMap.get('issueId');
    }

    let getUser = () => {
      return new Promise((resolve, reject) => {
        this.appService.getUser().subscribe(
          (apiResponse) => {
            console.log(apiResponse);
            if (apiResponse.status === 200) {
              this.user = apiResponse.data;
              //check whether new issue is being created or not
              if (this.add)
                this.issue.reporter = {
                  email: this.user.email,
                  firstName: this.user.firstName,
                  lastName: this.user.lastName
                };
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
    let getUsers = () => {
      return new Promise((resolve, reject) => {
        this.appService.getUsers().subscribe(
          (apiResponse) => {
            console.log(apiResponse);
            this.users = apiResponse.data;
            //to keep track of nonAssigned users
            this.nonAssignees = JSON.parse(JSON.stringify(apiResponse.data));
            resolve();
          },
          (err) => {
            if (err.status == 404) {
              reject("No user to assign an issue");
            }
            else {
              reject(err.error.message);
            }
          });
      });
    }

    let getIssue = () => {
      return new Promise((resolve, reject) => {
        if (this.add) {
          resolve();
        } else {
          this.issueService.getIssue({ issueId: this.issue.issueId }).subscribe(
            (apiResponse) => {
              console.log(apiResponse);
              if (apiResponse.status === 200) {
                this.issue = apiResponse.data;
                //to check what changes made
                this.oldIssue = JSON.parse(JSON.stringify(apiResponse.data));
                //check whether user is reporter or not
                //if not add it to nonAssignee array
                if (this.issue.reporter.email != this.user.email) {
                  this.nonAssignees.push({
                    email: this.user.email,
                    firstName: this.user.firstName,
                    lastName: this.user.lastName
                  });
                } else {
                  this.canUpdate = true;
                }
                //filter users which have been assigned task already
                this.nonAssignees = this.nonAssignees.filter(function (user) {
                  if (apiResponse.data.reporter.email == user.email) {
                    return false;
                  }
                  for (let assignee of apiResponse.data.assignees) {
                    if (assignee.to.email == user.email) {
                      return false;
                    }
                  }
                  return true;
                });

                //check user can edit or not
                if (!this.canUpdate) {
                  for (let assignee of apiResponse.data.assignees) {
                    if (assignee.to.email == this.user.email) {
                      this.canUpdate = true;
                      break;
                    }
                  }
                }
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
        }
      });
    }

    let getWatchersCount = () => {
      return new Promise((resolve, reject) => {
        if (this.add) {
          resolve();
        } else {
          this.issueService.getWatchersCount({ issueId: this.issue.issueId }).subscribe(
            (apiResponse) => {
              console.log(apiResponse);
              this.issue.watchersCount = apiResponse.data.count;
              resolve();
            },
            (err) => {
              reject(err.error.message);
            });
        }
      });
    }

    let getComments = () => {
      return new Promise((resolve, reject) => {
        if (this.add) {
          resolve();
        } else {
          this.issueService.getComments({ issueId: this.issue.issueId }).subscribe(
            (apiResponse) => {
              console.log(apiResponse);
              this.issue.comments = apiResponse.data;
              resolve();
            },
            (err) => {
              if (err.status == 404) {
                resolve();
              }
              else {
                reject(err.error.message);
              }
            });
        }
      });
    }

    let getWatchers = () => {
      return new Promise((resolve, reject) => {
        if (this.add) {
          resolve();
        } else {
          this.issueService.getWatchers({ issueId: this.issue.issueId }).subscribe(
            (apiResponse) => {
              console.log(apiResponse);
              this.issue.watchers = apiResponse.data;
              resolve();
            },
            (err) => {
              if (err.status == 404) {
                resolve();
              }
              else {
                reject(err.error.message);
              }
            });
        }
      });
    }

    let markNotificationAsRead = () => {
      return new Promise((resolve, reject) => {
        if (this.add) {
          resolve();
        } else {
          this.issueService.markNotificationsAsRead({ issueId: this.issue.issueId }).subscribe(
            (apiResponse) => {
              console.log(apiResponse);
              resolve();
            },
            (err) => {
              if (err.status == 500) {
                reject(err.error.message);
              }
              else {
                resolve();
              }
            });
        }
      });
    }

    getUser()
      .then(getUsers)
      .then(getIssue)
      .then(getWatchersCount)
      .then(getComments)
      .then(getWatchers)
      .then(markNotificationAsRead)
      .then(() => {
        console.info("Initialization Done");
      })
      .catch((errorMessage) => {
        this.toastr.error(errorMessage);
        this.router.navigate(['/dashboard']);
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
        //location.reload();
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

  public addAssignee(): void {
    if (this.assignee) {
      for (let i = 0; i < this.nonAssignees.length; i++) {
        if (this.nonAssignees[i].email == this.assignee) {
          //check the person is already a assignee
          let newAssignee = {
            to: {
              email: this.nonAssignees[i].email,
              firstName: this.nonAssignees[i].firstName,
              lastName: this.nonAssignees[i].lastName
            }
          }
          if (!this.add) {
            for (let assignee of this.oldIssue.assignees) {
              if (assignee.to.email == this.assignee) {
                newAssignee['assignedOn'] = assignee.assignedOn;
                break;
              }
            }
          }
          this.issue.assignees.push(newAssignee);
          this.assignee = "";
          this.nonAssignees.splice(i, 1);
          break;
        }
      }
    } else {
      this.toastr.warning('Select a user!');
    }
  }
  public removeAssignee(email): void {
    if (this.issue.assignees.length > 1) {
      for (let i = 0; i < this.issue.assignees.length; i++) {
        if (email == this.issue.assignees[i].to.email) {
          this.nonAssignees.push({
            email: this.issue.assignees[i].to.email,
            firstName: this.issue.assignees[i].to.firstName,
            lastName: this.issue.assignees[i].to.lastName
          });
          this.issue.assignees.splice(i, 1);
          break;
        }
      }
    } else {
      this.toastr.warning('There must be atleat one assignee!');
    }
  }

  public createIssue(): void {
    let data = {
      title: this.issue.title,
      description: this.issue.description,
      assignees: this.issue.assignees
    }
    this.issueService.createIssue(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          let data = apiResponse.data;
          this.toastr.success(apiResponse.message);
          this.router.navigate([`/issue/${data.issueId}`]);
          setTimeout(() => {
            location.reload();
          }, 1000);
        }
        else {
          this.toastr.error(apiResponse.message);
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      });
  }

  public updateIssue(): void {
    let data = {};
    if (this.issue.title != this.oldIssue.title) {
      data['title'] = this.issue.title
    }
    if (this.issue.description != this.oldIssue.description) {
      data['description'] = this.issue.description
    }
    if (this.issue.status != this.oldIssue.status) {
      data['status'] = this.issue.status
    }
    if (!this.areEqual(this.issue.assignees, this.oldIssue.assignees)) {
      data['assignees'] = this.issue.assignees
    }
    if (!data || Object.keys(data).length == 0) {
      this.toastr.error("Nothing to update");
    } else {
      data['issueId'] = this.issue.issueId;

      this.issueService.editIssue(data).subscribe(
        (apiResponse) => {
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.issue = apiResponse.data;
            this.oldIssue = JSON.parse(JSON.stringify(apiResponse.data));
            this.toastr.success(apiResponse.message);
          }
          else {
            this.toastr.error(apiResponse.message);
          }
        },
        (err) => {
          this.toastr.error(err.error.message);
        });
    }
  }

  public addComment(): void {
    if (!this.comment) {
      this.toastr.warning('Please enter any text!');
    }
    let data = {
      issueId: this.issue.issueId,
      comment: this.comment
    }
    this.issueService.addComment(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.issue.comments = apiResponse.data;
          this.toastr.success(apiResponse.message);
          this.comment = '';
        }
        else {
          this.toastr.error(apiResponse.message);
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      });
  }

  public watch(): void {
    let data = {
      issueId: this.issue.issueId
    }
    this.issueService.addWatcher(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.issue.watchers = apiResponse.data;
          this.issue.watchersCount++;
          this.toastr.success(apiResponse.message);
        }
        else {
          this.toastr.error(apiResponse.message);
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      });
  }

  public unwatch(): void {
    let data = {
      issueId: this.issue.issueId
    }
    this.issueService.removeWatcher(data).subscribe(
      (apiResponse) => {
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          this.issue.watchers = null;
          this.issue.watchersCount--;
          this.toastr.success(apiResponse.message);
        }
        else {
          this.toastr.error(apiResponse.message);
        }
      },
      (err) => {
        this.toastr.error(err.error.message);
      });
  }

  //check whether two arrays have same elements or not
  private areEqual(arr1: Array<any>, arr2: Array<any>): boolean {
    let n = arr1.length;
    let m = arr2.length;

    if (n != m)
      return false;

    let map = Object();
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (map[arr1[i].to.email] == null)
        map[arr1[i].to.email] = 1;
      else {
        count = map[arr1[i].to.email];
        count++;
        map[arr1[i].to.email] = count;
      }
    }


    for (let i = 0; i < n; i++) {
      if (!(arr2[i].to.email in map))
        return false;

      if (map[arr2[i].to.email] == 0)
        return false;

      count = map[arr2[i].to.email];
      --count;
      map[arr2[i].to.email] = count;
    }

    return true;
  }
}
