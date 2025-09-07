import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseResponse, Tontine, TontineResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TontineService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTontines(page: number = 1, limit: number = 10): Observable<TontineResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<TontineResponse>(`${this.apiUrl}/tontines/list`, { ...this.getConfigAuthorized(), params });
  }

  getTontineById(tontineId: number): Observable<BaseResponse<Tontine>> {
    return this.http.get<BaseResponse<Tontine>>(
      `${this.apiUrl}/tontines/${tontineId}`,
      this.getConfigAuthorized()
    );
  }

  updateTontineStatus(tontineId: number, status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED'): Observable<BaseResponse> {
    const body = { status };
    return this.http.put<BaseResponse>(
      `${this.apiUrl}/tontines/${tontineId}/admin/change-status`,
      body,
      this.getConfigAuthorized()
    );
  }
getCotisationsByMembre(
  tontineId: number,
  membreId: number,
  statutPaiement?: 'VALIDATED' | 'REJETED' | null
): Observable<BaseResponse<Tontine>> {
  let params = new HttpParams().set('membreId', membreId);

  if (statutPaiement) {
    params = params.set('statutPaiement', statutPaiement);
  }

  return this.http.get<BaseResponse<Tontine>>(
    `${this.apiUrl}/tontines/${tontineId}/cotisations`,
    {
      ...this.getConfigAuthorized(),
      params
    }
  );
}

 /**
   * Créditer le compte séquestre d'une tontine
   * @param tontineId ID de la tontine
   * @param amount Montant à déposer
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deposit(tontineId: number, amount: number): Observable<any> {
    const url = `${this.apiUrl}/tontines/${tontineId}/account/deposit`;
    return this.http.post(url, { amount }, this.getConfigAuthorized());
  }

  /**
   * Débiter le compte séquestre d'une tontine
   * @param tontineId ID de la tontine
   * @param amount Montant à retirer
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withdraw(tontineId: number, amount: number): Observable<any> {
    const url = `${this.apiUrl}/tontines/${tontineId}/account/withdrawal`;
    return this.http.post(url, { amount }, this.getConfigAuthorized());
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
