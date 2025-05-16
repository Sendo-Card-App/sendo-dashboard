import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseResponse, RequestsListResponse, RequestStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class NiuService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

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
   * GET /requests/list
   * @param page   Numéro de page (défaut = 1)
   * @param limit  Éléments par page (défaut = 10)
   * @param type   Filtrer par type de demande (optionnel)
   * @param status Filtrer par statut de demande (optionnel)
   */
  getRequestsList(
    page: number = 1,
    limit: number = 10,
    type?: string,
    status?: string,
    search?: string
  ): Observable<RequestsListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (type) { params = params.set('type', type); }
    if (status) { params = params.set('status', status); }
    if (search) { params = params.set('search', search); }

    return this.http.get<RequestsListResponse>(
      `${this.apiUrl}/requests/list`,
      {
        ...this.getConfigAuthorized(),
        params
      }
    );
  }

  /**
   * PUT /requests/{id}/{status}
   * Met à jour le statut d’une demande
   * @param id     Identifiant de la demande
   * @param status Nouveau statut (PROCESSED | UNPROCESSED | REJECTED)
   */
  updateRequestStatus(
    id: number,
    status: RequestStatus
  ): Observable<BaseResponse> {
    return this.http.put<BaseResponse>(
      `${this.apiUrl}/requests/${id}/${status}`,
      null, // pas de corps
      this.getConfigAuthorized()
    );
  }
}
