import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseResponse,
  FundRequest,
  FundRequestListResponse,
  FundRequestQueryParams,
  FundRequestStatus
} from '../models/index';
import { environment } from '../../../environments/environment'; // adapte le chemin si nécessaire

export interface UpdateFundRequestStatusPayload {
  status: 'CANCELLED' | 'PENDING';
}
@Injectable({
  providedIn: 'root'
})

export class FundRequestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getFundRequests(params: FundRequestQueryParams): Observable<FundRequestListResponse> {
    let queryParams = new HttpParams();
    if (params.page) queryParams = queryParams.set('page', params.page.toString());
    if (params.limit) queryParams = queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams = queryParams.set('status', params.status);
    if (params.startDate) queryParams = queryParams.set('startDate', params.startDate);
    if (params.endDate) queryParams = queryParams.set('endDate', params.endDate);

    return this.http.get<FundRequestListResponse>(
      `${this.apiUrl}/fund-requests/list`,
      {
        params: queryParams,
        ...this.getConfigAuthorized()
      }
    );
  }

  getFundRequestById(fundRequestId: number): Observable<BaseResponse<FundRequest>> {
    return this.http.get<BaseResponse<FundRequest>>(
      `${this.apiUrl}/fund-requests/${fundRequestId}`
      , this.getConfigAuthorized()
    );
  }

  deleteFundRequestAsAdmin(fundRequestId: number): Observable<{ message: string }> {
  return this.http.delete<{ message: string }>(
    `${this.apiUrl}/fund-requests/admin/${fundRequestId}`
    , this.getConfigAuthorized()
  );
}

updateFundRequestStatus(
  fundRequestId: number,
  payload: UpdateFundRequestStatusPayload
): Observable<BaseResponse> {
  return this.http.patch<BaseResponse>(
    `${this.apiUrl}/fund-requests/${fundRequestId}/status`,
    payload,
    this.getConfigAuthorized()
  );
}



  private getConfigAuthorized() {
    const dataRegistered = localStorage.getItem('login-sendo') || '{}'
    const data = JSON.parse(dataRegistered)
    return {
      headers: new HttpHeaders(
        {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Content-Type": "application/json",
          'Authorization': `Bearer ${data.accessToken}`
        }
      )
    }
  }
}
