import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Publicite, BaseResponse, PubliciteListResponse } from '../models/index';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PubAdminService {
  private apiUrl = `${environment.apiUrl}/admin/pubs`;

  constructor(private http: HttpClient) { }

  getPublicites(page: number = 1, limit: number = 10): Observable<PubliciteListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PubliciteListResponse>(this.apiUrl, { params, ...this.getConfigAuthorized() });
  }

  getPubliciteById(id: number): Observable<BaseResponse<Publicite>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<BaseResponse<Publicite>>(url, { ...this.getConfigAuthorized() });
  }
  updatePublicite(id: number, data: Publicite): Observable<BaseResponse<Publicite>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<BaseResponse<Publicite>>(url, data, { ...this.getConfigAuthorized() });
  }
  createPublicite(data: FormData): Observable<BaseResponse<Publicite>> {
    return this.http.post<BaseResponse<Publicite>>(this.apiUrl, data, this.getConfigAuthorized());
  }





  private getConfigAuthorized(contentType?: string) {
    const dataRegistered = localStorage.getItem('login-sendo') || '{}';
    const data = JSON.parse(dataRegistered);

    // Création des headers de base
    const headers: { [key: string]: string } = {
      'Authorization': `Bearer ${data.accessToken}`
    };

    // Ajout du Content-Type seulement si spécifié et pas pour FormData
    if (contentType && contentType !== 'multipart/form-data') {
      headers['Content-Type'] = contentType;
    }

    return {
      headers: new HttpHeaders(headers)
    };
  }
}
