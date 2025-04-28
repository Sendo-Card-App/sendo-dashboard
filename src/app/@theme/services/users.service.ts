import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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
