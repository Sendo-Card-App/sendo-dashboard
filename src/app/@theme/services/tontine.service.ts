import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseResponse, TontineResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TontineService {
   private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

 getTontines(page: number = 1, limit: number = 10): Observable<TontineResponse> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  return this.http.get<TontineResponse>(`${this.apiUrl}/tontines/list`, { ...this.getConfigAuthorized(), params });
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
