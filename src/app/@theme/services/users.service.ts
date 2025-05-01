import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MeResponse } from '../models';

export interface UserCreateRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  address?: string;
  roleId: number;
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

  constructor(private http: HttpClient) {}

  createUser(userData: UserCreateRequest): Observable<ApiResponse> {
    // Construction du payload exact selon les exigences du backend
    const payload = {
      firstname: userData.firstname.trim(),
      lastname: userData.lastname.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone?.trim() || null,
      address: userData.address?.trim() || null,
      roleId: Number(userData.roleId) // Conversion explicite en number
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
  limit: number = 10
): Observable<UsersResponse> {
  const params = new HttpParams()
    .set('page',  page.toString())
    .set('limit', limit.toString());

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
