import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // adapte le chemin si nécessaire
import { BaseResponse, SharedExpense, SharedExpenseResponse } from '../models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharedExpenseService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getSharedExpenses(options: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    startDate?: string;
    endDate?: string;
  }): Observable<SharedExpenseResponse> {
    let params = new HttpParams();

    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.status) params = params.set('status', options.status);
    if (options.startDate) params = params.set('startDate', options.startDate);
    if (options.endDate) params = params.set('endDate', options.endDate);

    return this.http.get<SharedExpenseResponse>(`${this.apiUrl}/shared-expense/list`, {
      ...this.getConfigAuthorized(),
      params
    });
  }

   /**
   * Récupère une dépense partagée par son ID.
   * @param idExpense ID de la dépense
   * @returns Observable<SharedExpense>
   */
  getSharedExpenseById(idExpense: number): Observable<BaseResponse<SharedExpense>> {
    return this.http.get<BaseResponse<SharedExpense>>(`${this.apiUrl}/shared-expense/${idExpense}`,this.getConfigAuthorized());
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
