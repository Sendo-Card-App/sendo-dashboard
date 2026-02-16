import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { PaginatedData } from "../models";


export class FundSubscriptionWithdrawalResponse {
    status: number;
    message: string;
    data: PaginatedData<FundSubscriptionWithdrawal>;
}

export class FundResponse {
    status: number;
    message: string;
    data: PaginatedData<Fund>;
}

export class FundSubscriptionWithdrawal {
    id: string;
    subscriptionId: string;
    userId: number;
    type: 'INTEREST_ONLY' | 'FULL_WITHDRAWAL';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    processedAt: Date;
    fundSubscription: FundSubscription;
    createdAt: Date;
    updatedAt: Date;
}

export class FundSubscription {
    id: string;
    userId: number;
    fundId: string;
    currency: 'CAD' | 'XAF';
    amount: number;
    commissionRate: number;
    interestAmount: number;
    startDate: Date;
    endDate: Date;
    status: 'MATURED' | 'ACTIVE' | 'CLOSED';
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        phone: string;
        email: string;
    }
}

export class Fund {
    id: string;
    amountXAF: number;
    amountCAD: number;
    name: string;
    annualCommission: number;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class FundSubscriptionService {
    private apiUrl = `${environment.apiUrl}`;
    
    constructor(private http: HttpClient) { }

    getFundWithdrawalRequests(
        page: number = 1,
        limit: number = 10,
        subscriptionId?: string,
        userId?: number,
        status?: string
      ): Observable<FundSubscriptionWithdrawalResponse> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = { page, limit };
    
        // On n’ajoute le filtre que s’il est défini
        if (status && status.trim() !== '') {
          params.status = status;
        }

        if (subscriptionId) params.subscriptionId = subscriptionId
        if (userId) params.userId = userId
    
        return this.http
          .get<FundSubscriptionWithdrawalResponse>(`${this.apiUrl}/fund-subscriptions/withdrawal-requests`, {
            params, ...this.getConfigAuthorized()
          })
          .pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Erreur lors du chargement des retraits:', error);
              return throwError(() => new Error(error.message || 'Erreur serveur'));
            })
        );
    }

    getFundPaliers(
        page: number = 1,
        limit: number = 10
      ): Observable<FundResponse> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = { page, limit };
    
        return this.http
          .get<FundResponse>(`${this.apiUrl}/fund-subscriptions/funds`, {
            params, ...this.getConfigAuthorized()
          })
          .pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Erreur lors du chargement des paliers de souscription:', error);
              return throwError(() => new Error(error.message || 'Erreur serveur'));
            })
        );
    }

    processRequest(
      data: { requestId: string; action: 'APPROVED' | 'REJECTED'}
    ): Observable<FundSubscriptionWithdrawal> {
    
      return this.http
        .post<FundSubscriptionWithdrawal>(`${this.apiUrl}/fund-subscriptions/withdrawals/process`, data, this.getConfigAuthorized())
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Erreur lors de la demande de retrait :', error);
            return throwError(() => new Error(error.message || 'Erreur serveur'));
          })
      );
    }

    /**
     * 🔐 Configuration avec Bearer Token
     */
    private getConfigAuthorized() {
        const dataRegistered = localStorage.getItem('login-sendo') || '{}';
        const data = JSON.parse(dataRegistered);
        return {
            headers: new HttpHeaders({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.accessToken}`,
            }),
        };
    }
}