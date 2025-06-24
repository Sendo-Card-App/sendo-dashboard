import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Conversation, Message } from '../models/chat';
import { BaseResponse, PaginatedData } from '../models';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getConversations(
    page?: number,
    limit?: number,
    status?: string
  ): Observable<BaseResponse<PaginatedData<Conversation>>> {
    let params = new HttpParams();

    if (page !== undefined) {
      params = params.set('page', page.toString());
    }

    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http
      .get<BaseResponse<PaginatedData<Conversation>>>(`${this.apiUrl}/chat/conversations`, {
        params,
        ...this.getConfigAuthorized(),
      })
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de la récupération des conversations :', error);
          return throwError(() => error);
        })
      );
  }

  getConversationsByUserId(userId: string | number): Observable<BaseResponse<Conversation[]>> {
  return this.http
    .get<BaseResponse<Conversation[]>>(`${this.apiUrl}/chat/conversations/${userId}`, this.getConfigAuthorized())
    .pipe(
      catchError((error) => {
        console.error(`Erreur lors de la récupération des conversations de l'utilisateur ${userId} :`, error);
        return throwError(() => error);
      })
    );
}

sendMessage(payload: {
  conversationId: string;
  content: string;
  senderType: 'CUSTOMER' | 'ADMIN';
  attachments?: string[];
}) {
  return this.http
    .post(`${this.apiUrl}/chat/messages`, payload, this.getConfigAuthorized())
    .pipe(
      catchError((error) => {
        console.error('Erreur lors de l’envoi du message :', error);
        return throwError(() => error);
      })
    );
}

getMessagesByConversationId(conversationId: string): Observable<BaseResponse<Message>> {
  const url = `${this.apiUrl}/chat/conversations/${conversationId}/messages`;
  return this.http
    .get<BaseResponse<Message>>(url, this.getConfigAuthorized())
    .pipe(
      catchError((error) => {
        console.error(`Erreur lors de la récupération des messages de la conversation ${conversationId} :`, error);
        return throwError(() => error);
      })
    );
}

changeConversationStatus(conversationId: string, status: 'OPEN' | 'CLOSED') {
  const url = `${this.apiUrl}/chat/conversations/${conversationId}/change-status`;
  const body = { status };

  return this.http
    .put(url, body, this.getConfigAuthorized())
    .pipe(
      catchError((error) => {
        console.error(`Erreur lors du changement de statut de la conversation ${conversationId} :`, error);
        return throwError(() => error);
      })
    );
}

updateMessage(messageId: string, payload: {
  content: string;
  read: boolean;
  attachments: string[];
}) {
  const url = `${this.apiUrl}/chat/messages/${messageId}`;
  return this.http
    .put(url, payload, this.getConfigAuthorized())
    .pipe(
      catchError((error) => {
        console.error(`Erreur lors de la mise à jour du message ${messageId} :`, error);
        return throwError(() => error);
      })
    );
}

getMessageById(messageId: string) {
  const url = `${this.apiUrl}/chat/messages/${messageId}`;
  return this.http
    .get(url, this.getConfigAuthorized())
    .pipe(
      catchError((error) => {
        console.error(`Erreur lors de la récupération du message ${messageId} :`, error);
        return throwError(() => error);
      })
    );
}

deleteMessage(messageId: string) {
  const url = `${this.apiUrl}/chat/messages/${messageId}`;
  return this.http
    .delete(url, this.getConfigAuthorized())
    .pipe(
      catchError((error) => {
        console.error(`Erreur lors de la suppression du message ${messageId} :`, error);
        return throwError(() => error);
      })
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
