// src/app/services/transactions.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseResponse, Transactions, TransactionStatus } from '../models';

interface PaginatedData<T> {
  page: number;
  totalPages: number;
  totalItems: number;
  items: T[];
}

interface TransactionsResponse {
  status: number;
  message: string;
  data: PaginatedData<Transactions>;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Récupère les headers (JWT, etc.) */
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
   * Récupère une transaction par son ID
   * @param transactionId ID de la transaction
   * @return Observable<Transactions>
   *
   */
  getTransactionById(transactionId: string): Observable<BaseResponse<Transactions>> {
    return this.http.get<BaseResponse<Transactions>>(
      `${this.apiUrl}/transactions/${transactionId}`,
      this.getConfigAuthorized()
    );
  }

   /**
   * PUT /admin/transaction/change-status
   * @param transactionId Identifiant externe de la transaction
   * @param status Nouveau statut à appliquer
   */
   updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus
  ): Observable<BaseResponse> {
    const params = new HttpParams()
      .set('transactionId', transactionId)
      .set('status', status);

    return this.http.put<BaseResponse>(
      `${this.apiUrl}/admin/transaction/change-status`,
      null, // pas de corps, tout passe en query
      {
        ...this.getConfigAuthorized(),
        params
      }
    );
  }

  /**
   * Récupère la liste paginée des transactions
   * @param page numéro de page (défaut : 1)
   * @param limit nombre d’éléments par page (défaut : 10)
   */
  getTransactions(page: number = 1, limit: number = 10): Observable<TransactionsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    const config = this.getConfigAuthorized();

    return this.http.get<TransactionsResponse>(
      `${this.apiUrl}/transactions`,
      { ...config, params }
    );
  }
}
