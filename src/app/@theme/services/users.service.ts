import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MeResponse } from '../models';
import { MerchantListResponse, MerchantResponse } from '../models/merchant';

export interface UserCreateRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  roleId: number;
  country: string;
}

interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data?: T;
}

export interface PaginatedUsers {
  page: number;
  totalPages: number;
  totalItems: number;
  items: MeResponse[];
}

export interface UsersResponse {
  status: number;
  message: string;
  data: PaginatedUsers;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private apiUrl1 = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  createUser(userData: UserCreateRequest): Observable<ApiResponse> {
    // Construction du payload exact selon les exigences du backend
    const payload = {
      firstname: userData.firstname.trim(),
      lastname: userData.lastname.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone?.trim() || null,
      address: userData.address?.trim() || null,
      dateOfBirth: userData.dateOfBirth ? String(userData.dateOfBirth) : null, // Assure que c'est un string
      placeOfBirth: userData.placeOfBirth || null,
      roleId: Number(userData.roleId),
      country: userData.country?.trim() || null
    };

    return this.http.post<ApiResponse>(
      this.apiUrl,
      payload,
      this.getConfigAuthorized()
    );
  }

  updatePassword(
    oldPassword: string,
    newPassword: string
  ): Observable<{ message: string }> {
    const dataRegistered = localStorage.getItem('user-info') || '{}'
    const data = JSON.parse(dataRegistered)

    return this.http.put<{ message: string }>(
      `${this.apiUrl}/update-password/${data.id}`, // Endpoint PUT
      {
        oldPassword,
        newPassword
      },
      this.getConfigAuthorized()
    );
  }

  updateUser(
    userId: string | number,
    userData: Partial<MeResponse>
  ): Observable<{ message: string; data: Partial<MeResponse> }> {
    return this.http.put<{ message: string; data: Partial<MeResponse> }>(
      `${this.apiUrl}/${userId}`,
      userData,
      this.getConfigAuthorized()
    );
  }


  getUsers(
  page: number = 1,
  limit: number = 10,
  country: string | null = null,
  search: string | null = null
): Observable<UsersResponse> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  // Correction : HttpParams est immuable, il faut réassigner
  if (country) {
    params = params.set('country', country);
  }
  if (search) {
    params = params.set('search', search);
  }

  const config = this.getConfigAuthorized();
  return this.http.get<UsersResponse>(`${this.apiUrl}`, {
    params,
    headers: config.headers
  });
}


  getUserById(userId: string | number): Observable<ApiResponse<MeResponse>> {
    const config = this.getConfigAuthorized();
    return this.http.get<ApiResponse<MeResponse>>(
      `${this.apiUrl}/${userId}`,
      { headers: config.headers }
    ).pipe(
      catchError(error => {
        // Transformation de l'erreur pour une meilleure gestion
        let errorMessage = 'Une erreur est survenue';
        if (error.status === 404) {
          errorMessage = 'Utilisateur non trouvé';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => ({
          message: errorMessage,
          status: error.status || 500
        }));
      })
    );
  }

  // Delete user by ID
  deleteUser(userId: string | number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${userId}`, this.getConfigAuthorized());
  }

  //update user by ID
  updateUserById(userId: string | number, userData: Partial<MeResponse>): Observable<{ message: string; data: Partial<MeResponse> }> {
    return this.http.put<{ message: string; data: Partial<MeResponse> }>(
      `${this.apiUrl}/${userId}`,
      userData,
      this.getConfigAuthorized()
    );
  }

  /**
   * Recharger un portefeuille (ADMIN)
   * @param matriculeWallet identifiant du portefeuille
   * @param amount montant à recharger
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deposit(matriculeWallet: string, amount: number): Observable<any> {
    const url = `${this.apiUrl1}/wallet/deposit`;
    return this.http.post(url, { matriculeWallet, amount }, this.getConfigAuthorized());
  }

  /**
   * Retirer un montant d'un portefeuille (ADMIN)
   * @param matriculeWallet identifiant du portefeuille
   * @param amount montant à retirer
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withdraw(matriculeWallet: string, amount: number): Observable<any> {
    const url = `${this.apiUrl1}/wallet/withdrawal`;
    return this.http.post(url, { matriculeWallet, amount }, this.getConfigAuthorized());
  }

   /**
   * 🔍 Récupère la liste des marchands avec pagination
   * @param page Numéro de la page
   * @param limit Nombre d’éléments par page
   */
  getMerchants(page?: number, limit?: number): Observable<MerchantListResponse> {
  let params = new HttpParams();

  if (page) params = params.set('page', page.toString());
  if (limit) params = params.set('limit', limit.toString());

  return this.http.get<MerchantListResponse>(
    `${this.apiUrl}/merchants`,
    { params, ...this.getConfigAuthorized() }
  );
}

getMerchantById(id: number): Observable<MerchantResponse> {
  return this.http.get<MerchantResponse>(
    `${this.apiUrl}/merchant/${id}`,
    this.getConfigAuthorized()
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
