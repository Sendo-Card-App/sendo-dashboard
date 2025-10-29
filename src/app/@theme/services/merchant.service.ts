import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** ✅ Interfaces de base **/
export interface BaseResponse {
  status?: number;
  success?: boolean;
  message: string;
}

export interface CommissionPayload {
  typeCommission: 'POURCENTAGE' | 'FIXE';
  montantCommission: number;
  description: string;
}

export interface CommissionResponse extends BaseResponse {
  data?: {
    id?: number;
    typeCommission: string;
    montantCommission: number;
    description: string;
    createdAt?: string;
  };
}

export interface PalierPayload {
  montantMin: number;
  montantMax: number;
  commissionId: number;
  description: string;
}

export interface PalierResponse {
  id: number;
  montantMin: number;
  montantMax: number;
  commissionId: number;
  description: string;
  dateCreation?: string;
  dateMiseAJour?: string;
}


@Injectable({
  providedIn: 'root',
})
export class MerchantService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * 💰 Créer une nouvelle commission
   * Endpoint : POST /merchant/commission
   */
  createCommission(payload: CommissionPayload): Observable<CommissionResponse> {
    return this.http.post<CommissionResponse>(
      `${this.apiUrl}/merchant/commission`,
      payload,
      this.getConfigAuthorized()
    );
  }

  updateCommission(id: number, payload: CommissionPayload): Observable<CommissionResponse> {
    return this.http.put<CommissionResponse>(
      `${this.apiUrl}/merchant/commission/${id}`,
      payload,
      this.getConfigAuthorized()
    );
  }

  getAllCommissions(): Observable<CommissionResponse[]> {
    return this.http.get<CommissionResponse[]>(
      `${this.apiUrl}/merchant/commissions`,
      this.getConfigAuthorized()
    );
  }

  getCommissionById(id: number): Observable<CommissionResponse> {
    return this.http.get<CommissionResponse>(
      `${this.apiUrl}/merchant/commission/${id}`,
      this.getConfigAuthorized()
    );
  }

  // ✅ CREATE : Créer un nouveau palier
  createPalier(payload: PalierPayload): Observable<PalierResponse> {
    return this.http.post<PalierResponse>(
      `${this.apiUrl}/merchant/palier`,
      payload,
      this.getConfigAuthorized()
    );
  }

  // 📖 READ : Récupérer tous les paliers
  getAllPaliers(): Observable<PalierResponse[]> {
    return this.http.get<PalierResponse[]>(
      `${this.apiUrl}/merchant/paliers`,
      this.getConfigAuthorized()
    );
  }

  // 📖 READ (by ID) : Récupérer un palier spécifique
  getPalierById(id: number): Observable<PalierResponse> {
    return this.http.get<PalierResponse>(
      `${this.apiUrl}/merchant/palier/${id}`,
      this.getConfigAuthorized()
    );
  }

  // ✏️ UPDATE : Modifier un palier existant
  updatePalier(id: number, payload: PalierPayload): Observable<PalierResponse> {
    return this.http.put<PalierResponse>(
      `${this.apiUrl}/merchant/palier/${id}`,
      payload,
      this.getConfigAuthorized()
    );
  }

  // ❌ DELETE : Supprimer un palier
  deletePalier(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/merchant/palier/${id}`,
      this.getConfigAuthorized()
    );
  }

  



  /**
   * 🔐 Configuration avec Bearer Token
   */
  private getConfigAuthorized() {
    const dataRegistered = localStorage.getItem('login-sendo') || '{}';
    const data = JSON.parse(dataRegistered);
    return {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.accessToken}`,
      }),
    };
  }
}
