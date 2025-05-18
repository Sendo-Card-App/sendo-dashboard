import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { BaseResponse, Config } from '../models/index';

export interface UpdateConfigRequest {
  value: number;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

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

  /**
   * GET /configs
   * Récupère toutes les configurations
   */
  getConfigs(): Observable<BaseResponse> {
    return this.http.get<BaseResponse>(
      `${this.apiUrl}/configs`,
      this.getConfigAuthorized()
    );
  }
  updateConfig(
    id: number,
    payload: UpdateConfigRequest
  ): Observable<BaseResponse & { data: Config }> {
    return this.http.put<BaseResponse & { data: Config }>(
      `${this.apiUrl}/configs/${id}`,
      payload,
      this.getConfigAuthorized()
    );
  }
}
