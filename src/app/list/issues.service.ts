import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppService } from '../app.service';

@Injectable({
  providedIn: 'root'
})
export class IssuesService {

  private url = 'http://localhost:3000/api/v1/issues';

  constructor(private http: HttpClient, public appService: AppService) { }

  private handleError(err: HttpErrorResponse) {
    return Observable.throw(err.message);
  }

  public getIssues(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('limit', data.limit ? data.limit : '')
      .set('sort', data.sort ? data.sort : '')
      .set('skip', data.skip ? data.skip : '')
      .set('searchType', data.searchType ? data.searchType : '')
      .set('search', data.search ? data.search : '');
    return this.http.get(`${this.url}/all`, { params: params });
  }

  public getIssuesCount(data): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.appService.getUserInfoFromLocalStorage().authToken)
      .set('searchType', data.searchType ? data.searchType : '')
      .set('search', data.search ? data.search : '');
    return this.http.get(`${this.url}/all/count`, { params: params });
  }
}
