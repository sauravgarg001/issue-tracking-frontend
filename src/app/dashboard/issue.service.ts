import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppService } from '../app.service';

@Injectable({
  providedIn: 'root'
})
export class IssueService {

  private url = 'http://localhost:3000/api/v1/issues';

  constructor(private http: HttpClient, public appService: AppService) { }

  private handleError(err: HttpErrorResponse) {
    return Observable.throw(err.message);
  }

  public createIssue(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('title', data.title)
      .set('description', data.description)
      .set('assignees', encodeURI(JSON.stringify(data.assignees)));

    return this.http.post(`${this.url}/`, params);
  }

  public getIssue(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('issueId', data.issueId);

    return this.http.get(`${this.url}/`, { params: params });
  }

  public getIssuesAssigned(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('limit', data.limit ? data.limit : '')
      .set('sort', data.sort ? data.sort : '')
      .set('skip', data.skip ? data.skip : '')
      .set('searchType', data.searchType ? data.searchType : '')
      .set('search', data.search ? data.search : '');
    return this.http.get(`${this.url}/all/assigned`, { params: params });
  }

  public getIssuesAssignedCount(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('searchType', data.searchType ? data.searchType : '')
      .set('search', data.search ? data.search : '');
    return this.http.get(`${this.url}/all/assigned/count`, { params: params });
  }

  public getIssuesReported(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('limit', data.limit ? data.limit : '')
      .set('sort', data.sort ? data.sort : '')
      .set('skip', data.skip ? data.skip : '')
      .set('searchType', data.searchType ? data.searchType : '')
      .set('search', data.search ? data.search : '');
    return this.http.get(`${this.url}/all/reported`, { params: params });
  }

  public getIssuesReportedCount(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('searchType', data.searchType ? data.searchType : '')
      .set('search', data.search ? data.search : '');
    return this.http.get(`${this.url}/all/reported/count`, { params: params });
  }

  public editIssue(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('issueId', data.issueId)
      .set('title', data.title ? data.title : '')
      .set('description', data.description ? data.description : '')
      .set('status', data.status ? data.status : '')
      .set('assignees', data.assignees ? encodeURI(JSON.stringify(data.assignees)) : '');

    return this.http.put(`${this.url}/`, params);
  }

  public addWatcher(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('issueId', data.issueId);

    return this.http.post(`${this.url}/watch/`, params);
  }

  public getWatchers(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('issueId', data.issueId);

    return this.http.get(`${this.url}/watch/all`, { params: params });
  }

  public getWatchersCount(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('issueId', data.issueId);

    return this.http.get(`${this.url}/watch/all/count`, { params: params });
  }

  public removeWatcher(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('issueId', data.issueId);

    return this.http.delete(`${this.url}/watch/`, { params: params });
  }

  public addComment(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('issueId', data.issueId)
      .set('comment', data.comment);

    return this.http.post(`${this.url}/comment/`, params);
  }

  public getComments(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('issueId', data.issueId);

    return this.http.get(`${this.url}/comment/all`, { params: params });
  }

  public markNotificationsAsRead(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('issueId', data.issueId);

    return this.http.put(`${this.url}/notifications/mark`, params);
  }

}
