import { BaseResponse } from './../models/index';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { SessionPartyUserResponse, KycDocument, CardStatus, CardResponse, VirtualCard, CardTransactionResponse } from '../models/card';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CardService {
  private apiUrl = environment.apiUrl; // Remplace par ton URL base

  constructor(private http: HttpClient) { }

  // card.service.ts

  getOnboardingRequests(status?: string): Observable<SessionPartyUserResponse> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<SessionPartyUserResponse>(
      `${this.apiUrl}/cards/onboarding/requests/admin`,
      { params, ...this.getConfigAuthorized() }
    );
  }

  sendDocumentToNeero(documentType: 'ID_PROOF' | 'ADDRESS_PROOF' | 'NIU_PROOF' | 'SELFIE', userId: number) {
    const body = { documentType, userId };
    return this.http.post(`${this.apiUrl}/cards/onboarding/admin/send-docs`, body, this.getConfigAuthorized());
  }

  submitDocumentsToNeero(userId: number) {
    return this.http.post(`${this.apiUrl}/cards/onboarding/admin/submit`, { userId }, this.getConfigAuthorized());
  }

  getKycDocuments(userId: number | string): Observable<BaseResponse<KycDocument>> {
    return this.http.get<BaseResponse<KycDocument>>(`${this.apiUrl}/admin/kyc/${userId}/list`, this.getConfigAuthorized());
  }

  getCards(
    page: number = 1,
    limit: number = 10,
    status?: CardStatus
  ): Observable<CardResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<CardResponse>(`${this.apiUrl}/cards/admin`, { params, ...this.getConfigAuthorized() });
  }

  getCardById(cardId: number): Observable<BaseResponse<VirtualCard>> {
    return this.http.get<BaseResponse<VirtualCard>>(`${this.apiUrl}/cards/${cardId}`, this.getConfigAuthorized());
  }

  getCardTransactions(cardId: number): Observable<CardTransactionResponse> {
    return this.http.get<CardTransactionResponse>(`${this.apiUrl}/cards/${cardId}/transactions`, this.getConfigAuthorized());
  }

  freezeOrUnfreezeCard(cardId: number, action: 'FREEZE' | 'UNFREEZE'): Observable<BaseResponse> {
    return this.http.put<BaseResponse>(`${this.apiUrl}/cards/admin/${cardId}/status`, { action },{...this.getConfigAuthorized()});
  }

  deleteCard(cardId: number): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(`${this.apiUrl}/cards/${cardId}`, this.getConfigAuthorized());
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
