import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseResponse, Debt, DebtResponse } from '../models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DebtService {
   private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Récupère toutes les dettes du système avec pagination dynamique.
   * @param page Numéro de la page (par défaut 1)
   * @param limit Nombre d'éléments par page (par défaut 10)
   */
  getAllDebts(page: number = 1, limit: number = 10): Observable<DebtResponse> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  return this.http.get<DebtResponse>(`${this.baseUrl}/debts/all`, { params, ...this.getConfigAuthorized() });
}


  /**
 * 🔹 Récupérer les dettes d’un utilisateur par son ID
 * Endpoint : GET /debts/users/{userId}
 */
  getUserDebts(userId: number): Observable<BaseResponse<Debt[]>> {
    return this.http.get<BaseResponse<Debt[]>>(
      `${this.baseUrl}/debts/users/${userId}`, this.getConfigAuthorized()
    );
  }

  /**
   * 💳 Payer une dette via une carte
   * Endpoint : POST /debts/{idDebt}/{idCard}/pay-from-card
   */
  payDebtFromCard(idDebt: number, idCard: number): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${this.baseUrl}/debts/${idDebt}/${idCard}/pay-from-card`,
      {}, this.getConfigAuthorized()
    );
  }

  payAllDebtsFromCard(idCard: number): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${this.baseUrl}/debts/${idCard}/pay-from-card`,
      {}, this.getConfigAuthorized()
    );
  }

  payDebtFromWallet(idDebt: number, userId: number): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${this.baseUrl}/debts/${idDebt}/${userId}/pay-from-wallet`,
      {}, this.getConfigAuthorized()
    );
  }

  payAllDebtsFromWallet(userId: number): Observable<BaseResponse<null>> {
    return this.http.post<BaseResponse<null>>(
      `${this.baseUrl}/debts/${userId}/pay-from-wallet`,
      {}, this.getConfigAuthorized()
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
