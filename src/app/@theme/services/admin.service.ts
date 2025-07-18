import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BaseResponse, ChangeUserStatusRequest, RemoveRoleRequest } from '../models';
import { StatisticsResponse } from '../models/statistics';

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

  constructor(private http: HttpClient) { }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<RolesResponse>(`${this.apiUrl}/roles`, this.getConfigAuthorized()).pipe(
      map(response => response.data) // Extrait directement le tableau data
    );
  }

  /**
   * Crée un nouveau rôle via POST /admin/roles
   * @param name Nom du rôle à créer
   * @returns Observable<Role> retournant l’objet créé
   */
  createRole(name: string): Observable<Role> {
    return this.http.post<Role>(
      `${this.apiUrl}/roles`,
      { name },
      this.getConfigAuthorized()
    );
  }


  /**
   * Met à jour le nom d’un rôle existant via PUT /admin/roles/{id}
   * @param id    Identifiant du rôle
   * @param name  Nouveau nom
   * @returns Observable<Role> retournant l’objet mis à jour
   */
  updateRole(id: number, name: string): Observable<Role> {
    return this.http.put<Role>(
      `${this.apiUrl}/roles/${id}`,
      { name },
      this.getConfigAuthorized()
    );
  }

  /**
   * Assigne une ou plusieurs rôles à un utilisateur
   * PUT /admin/users/atribute-role
   * Body: { userId: number, rolesId: number[] }
   */
  assignRolesToUser(userId: number, rolesId: number[]) {
    const url = `${this.apiUrl}/users/attribute-role`;
    return this.http.put(
      url,
      { userId, rolesId },
      this.getConfigAuthorized()
    );
  }

  /**
   * Supprime un rôle d’un utilisateur
   * DELETE /admin/users/remove-role
   * Body: { userId: number, roleId: number }
   */
  removeRoleFromUser(userId: number, roleId: number){
    const url = `${this.apiUrl}/users/remove-role`;
    // Angular HttpClient.delete peut prendre un body en option
    return this.http.delete(
      url,
      {
        ...this.getConfigAuthorized(),
        body: { userId, roleId }
      }
    );
  }

  changeUserStatus(request: ChangeUserStatusRequest): Observable<BaseResponse> {
    // 1) On construit les query params
    const params = new HttpParams()
      .set('email', request.email)
      .set('status', request.status);

    // 2) On appelle PUT sans body (null) et avec options qui fusionnent headers + params
    return this.http.put<BaseResponse>(
      `${this.apiUrl}/users/change-status`, // veillez à bien utiliser le bon chemin
      null,
      {
        ...this.getConfigAuthorized(),
        params
      }
    );
  }

  removeUserRole(request: RemoveRoleRequest): Observable<BaseResponse> {
    return this.http.delete<BaseResponse>(
      `${this.apiUrl}/users/remove-role `,
      {  ...this.getConfigAuthorized(),
        body: request
       }, // Note: pour DELETE avec body
    );
  }

  /**
   * GET /admin/statistics
   * Récupère toutes les statistiques du système
   */
  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(
      `${this.apiUrl}/statistics`,
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
