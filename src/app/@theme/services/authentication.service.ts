// src/app/services/authentication.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../types/user';
import { BaseResponse, Login } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  private url = environment.apiUrl + environment.authUrl;


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

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('login-sendo')
    this.currentUserSubject.next(null);
  }
}
