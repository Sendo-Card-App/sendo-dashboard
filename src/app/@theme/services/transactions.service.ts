// src/app/services/transactions.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseResponse, PaginatedData, Transactions, TransactionStatus,TransactionType } from '../models';



interface TransactionsResponse {
  status: number;
  message: string;
  data: PaginatedData<Transactions>;
}

export interface ChangeTransactionStatusPayload {
  transactionReference: string;
  bankName: string;
  accountNumber: string;
}

export interface TransactionsUserResponse {
  status: number;
  message: string;
  data: {
    user: {
        firstName?: string;
        lastName?: string;
        id: string;
        email: string;
        phone: string;
      };
    transactions: PaginatedData<Transactions>;
  };
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
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'BLOCKED',
  payload: ChangeTransactionStatusPayload
): Observable<BaseResponse> {
  const params = new HttpParams()
    .set('transactionId', transactionId)
    .set('status', status);

  return this.http.put<BaseResponse>(
    `${this.apiUrl}/admin/transaction/change-status`,
    payload, // <-- le corps JSON
    {
      ...this.getConfigAuthorized(),
      params,
    }
  );
}


  /**
   * Récupère toutes les transactions d’un utilisateur, avec pagination et filtres facultatifs
   * @param userId Identifiant de l’utilisateur
   * @param page Numéro de page (défaut : 1)
   * @param limit Nombre d’éléments par page (défaut : 10)
   * @param type Filtrer par type de transaction (DEPOSIT | WITHDRAWAL | TRANSFER)
   * @param status Filtrer par statut (PENDING | COMPLETED | FAILED | BLOCKED)
   * @param method Filtrer par méthode (MOBILE_MONEY | BANK_TRANSFER)
   * @param startDate Date de début (ISO string)
   * @param endDate Date de fin (ISO string)
   */
  getUserTransactions(
    userId: number,
    page: number = 1,
    limit: number = 10,
    type?: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER',
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'BLOCKED',
    method?: 'MOBILE_MONEY' | 'BANK_TRANSFER',
    startDate?: string,
    endDate?: string
  ): Observable<TransactionsUserResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (type)       { params = params.set('type', type); }
    if (status)     { params = params.set('status', status); }
    if (method)     { params = params.set('method', method); }
    if (startDate)  { params = params.set('startDate', startDate); }
    if (endDate)    { params = params.set('endDate', endDate); }

    return this.http.get<TransactionsUserResponse>(
      `${this.apiUrl}/transactions/users/${userId}`,
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
  getTransactions(
    page: number = 1,
    limit: number = 10,
    type?: TransactionType,
    status?: TransactionStatus,
    method?: 'MOBILE_MONEY' | 'BANK_TRANSFER',
    startDate?: string,   // format YYYY-MM-DD
    endDate?: string      // format YYYY-MM-DD
  ): Observable<TransactionsResponse> {
    let params = new HttpParams()
      .set('page',   page.toString())
      .set('limit',  limit.toString());

    if (type)      { params = params.set('type',      type); }
    if (status)    { params = params.set('status',    status); }
    if (method)    { params = params.set('method',    method); }
    if (startDate) { params = params.set('startDate', startDate); }
    if (endDate)   { params = params.set('endDate',   endDate); }

    return this.http.get<TransactionsResponse>(
      `${this.apiUrl}/transactions`,
      {
        ...this.getConfigAuthorized(),
        params
      }
    );
  }
}
