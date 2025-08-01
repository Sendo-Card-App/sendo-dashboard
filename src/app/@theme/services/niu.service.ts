import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RequestsListResponse, RequestStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class NiuService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

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
  /**
   * PUT /requests/{id}
   * Met à jour le statut d’une demande, avec raison et fichier en multipart/form-data
   *
   * @param id     Identifiant de la demande
   * @param status Nouveau statut (PROCESSED | UNPROCESSED | REJECTED)
   * @param reason Motif du rejet (uniquement si status === 'REJECTED')
   * @param file   Fichier binaire à joindre (ex. pièce justificative)
   */
 updateRequestStatus(
  id: number,
  status: RequestStatus,
  reason?: string,
  file?: File
): Observable<RequestsListResponse> {
  const formData = new FormData();
  formData.append('status', status);

  if (reason) {
    formData.append('reason', reason);
  }
  if (file) {
  formData.append('request', file, file.name); // ✅ Correspond à Swagger
}

  // Ne pas spécifier 'multipart/form-data', le navigateur le fera automatiquement
  return this.http.put<RequestsListResponse>(
    `${this.apiUrl}/requests/${id}`,
    formData,
    this.getConfigAuthorized() // Pas de Content-Type spécifié
  );
}
}
