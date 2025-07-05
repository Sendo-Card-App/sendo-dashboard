import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { SessionPartyUserResponse } from '../models/card';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CardService {
  private apiUrl = environment.apiUrl; // Remplace par ton URL base

  constructor(private http: HttpClient) {}

 // card.service.ts

getOnboardingRequests(status?: string): Observable<SessionPartyUserResponse> {
  let params = new HttpParams();
  
  if (status) {
    params = params.set('status', status);
  }

  return this.http.get<SessionPartyUserResponse>(
    `${this.apiUrl}/cards/onboarding/requests/admin`,
    { params, ...this.getConfigAuthorized() }
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
