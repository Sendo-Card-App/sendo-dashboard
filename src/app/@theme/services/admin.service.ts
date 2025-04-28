import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Role {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RolesResponse {
  status: number;
  message: string;
  data: Role[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<Role[]> {
    return this.http.get<RolesResponse>(`${this.apiUrl}/roles`, this.getConfigAuthorized()).pipe(
      map(response => response.data) // Extrait directement le tableau data
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
