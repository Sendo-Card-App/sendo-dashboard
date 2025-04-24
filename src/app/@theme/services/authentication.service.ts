// src/app/services/authentication.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../types/user';
import { Role } from '../types/role';

interface LoginResponse {
  accessToken: string;
  deviceId: string;
}
interface MeResponse {
  firstName?: string;
  lastName?: string;
  id: string;
  email: string;
  name: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
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

  login(email: string, password: string): Observable<User> {
    let token!: string;
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(r => token = r.accessToken),
        switchMap(() => this.http.get<MeResponse>(`${environment.apiUrl}/users/me`)),
        map(profile => {
          const u = new User();
          u.serviceToken = token;
          u.user = {
            firstName: profile.firstName,
            lastName:  profile.lastName,
            id:        profile.id,
            email:     profile.email,
            password:  '',
            name:      profile.name,
            role:      profile.role
          };
          return u;
        }),
        tap(u => {
          localStorage.setItem('currentUser', JSON.stringify(u));
          this.currentUserSubject.next(u);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
