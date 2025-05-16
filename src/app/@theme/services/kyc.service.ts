// src/app/@theme/services/kyc.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseResponse, KycDocument, KycPendingResponse, PaginatedData, UserKycResponse } from '../models';



/** Response spécifique KYC pending */


export interface ReviewKycRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface BulkReviewItem {
  id: number;
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}


export interface BulkReviewRequest {
  documents: BulkReviewItem[];
}

export interface KycListResponse extends BaseResponse {
  data: PaginatedData<KycDocument>;
}

@Injectable({ providedIn: 'root' })
export class KycService {
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
   * Récupère tous les documents KYC en attente ("PENDING")
   * @param page  Numéro de page (défaut : 1)
   * @param limit Nombre d’éléments par page (défaut : 10)
   */
  getPendingDocuments(
    page: number = 1,
    limit: number = 10
  ): Observable<KycPendingResponse> {
    const params = new HttpParams()
      .set('page',  page.toString())
      .set('limit', limit.toString());

    return this.http.get<KycPendingResponse>(
      `${this.apiUrl}/admin/kyc/pending`,
      {
        ...this.getConfigAuthorized(),
        params
      }
    );
  }

  /**
   * GET /users/{id}/kyc
   * Récupère tous les documents KYC + infos utilisateur
   */
  getUserKyc(userId: number): Observable<UserKycResponse> {
    return this.http.get<UserKycResponse>(
      `${this.apiUrl}/users/${userId}/kyc`,
      this.getConfigAuthorized()
    );
  }

   /**
   * Valide ou rejette un document KYC
   * @param documentId ID du document à reviewer
   * @param payload    { status: 'APPROVED'|'REJECTED', rejectionReason?: string }
   */
   reviewKyc(
    documentId: number,
    payload: ReviewKycRequest
  ): Observable<BaseResponse> {
    return this.http.put<BaseResponse>(
      `${this.apiUrl}/admin/kyc/${documentId}/review`,
      payload,
      this.getConfigAuthorized()
    );
  }

  bulkReview(request: BulkReviewRequest): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(
      `${this.apiUrl}/admin/kyc/bulk-review`,
      request,
      this.getConfigAuthorized()
    );
  }

   /**
   * Récupère tous les documents KYC
   * GET /admin/kyc/list
   * @param page   Numéro de page (défaut 1)
   * @param limit  Éléments par page (défaut 10)
   * @param status Filtrer par statut (PENDING, APPROVED, REJECTED...)
   */
   getAllKyc(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<KycListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<KycListResponse>(
      `${this.apiUrl}/admin/kyc/list`,
      {
        ...this.getConfigAuthorized(),
        params
      }
    );
  }
}
