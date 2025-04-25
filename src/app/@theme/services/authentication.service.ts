// src/app/services/authentication.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../types/user';
import { BaseResponse, MeResponse, Login } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  private url = environment.apiUrl + environment.authUrl;
  private urlcurl = environment.apiUrl;

  private getConfig() {
    return {
      headers: new HttpHeaders(
        {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Content-Type": "application/json"
        }
      )
    }
  };

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

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private httpClient: HttpClient) {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }


  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }


  public isLoggedIn(): boolean {
    return !!this.currentUserValue?.serviceToken;
  }


  public isLoggedIn$(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => !!user?.serviceToken)
    );
  }

  login(data: Login) {
    return this.httpClient.post<BaseResponse>(`${this.url}/login`, data, this.getConfig());
  }
  getUserIdentifiant(){
    return this.httpClient.get<BaseResponse>(`${this.urlcurl}/users/me`, this.getConfigAuthorized());
  }

  public getStoredUser(): MeResponse | null {
    const raw = localStorage.getItem('user-info');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as MeResponse;
    } catch {
      return null;
    }
  }

  logout(): Observable<void> {
    // Récupère le deviceId depuis le localStorage
    const authData = JSON.parse(localStorage.getItem('login-sendo') || '{}');
    const deviceId = authData.deviceId;

    if (!deviceId) {
        console.error('DeviceId is required for logout');
        this.clearSession();
        return throwError(() => new Error('DeviceId required'));
    }

    return this.httpClient.post<void>(
        `${this.url}/logout`,
        { deviceId },
        this.getConfigAuthorized()
    ).pipe(
        catchError(error => {
            console.error('Logout API error:', error);
            return throwError(() => error);
        }),
        finalize(() => {
            this.clearSession();
        })
    );
}

public clearSession(): void {
    localStorage.removeItem('login-sendo');
    localStorage.removeItem('user-info');
    this.currentUserSubject.next(null);
}
}
