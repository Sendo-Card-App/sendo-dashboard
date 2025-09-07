import { Injectable, OnDestroy } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private newMessageSubscription?: Subscription;

  constructor(private socket: Socket) {
    this.setupConnectionListeners();
    this.setupEventListeners();
  }

  private setupConnectionListeners() {
    this.socket.fromEvent('connect').subscribe(() => {
      console.log('Socket connected:', this.socket.ioSocket.id);

      // S'abonner à l'événement new_message uniquement après connexion
      this.subscribeToNewMessage();
    });

    this.socket.fromEvent('disconnect').subscribe((reason: string) => {
      console.log('Socket disconnected:', reason);

      // Nettoyer l'abonnement lors de la déconnexion
      this.unsubscribeFromNewMessage();
    });

    this.socket.fromEvent('connect_error').subscribe((err: Error) => {
      console.error('Socket connection error:', err);
    });
  }

  private subscribeToNewMessage() {
    if (!this.newMessageSubscription) {
      this.newMessageSubscription = this.socket.fromEvent('new_message').subscribe(msg => {
        console.log('Nouveau message reçu:', msg);
      });
    }
  }

  private unsubscribeFromNewMessage() {
    if (this.newMessageSubscription) {
      this.newMessageSubscription.unsubscribe();
      this.newMessageSubscription = undefined;
    }
  }

  private setupEventListeners() {
    this.socket.fromEvent('typing').subscribe((conversationId: string) => {
      console.log('User typing in:', conversationId);
    });

    this.socket.fromEvent('stop_typing').subscribe((conversationId: string) => {
      console.log('User stopped typing in:', conversationId);
    });
  }

  sendMessage(data: { conversationId: string; content: string; attachments?: string[], senderType: string }) {
    if (!this.socket.connected) {
      console.warn('⚠️ Socket not connected');
      return false;
    }

    console.log("📤 Envoi du message via socket:", data);
    this.socket.emit('send_message', data);
    return true;
  }

  onNewMessage() {
    return this.socket.fromEvent('new_message');
  }

  joinConversation(conversationId: string) {
    console.log('📥 Joining conversation:', conversationId);
    this.socket.emit('join_conversation', conversationId); // envoyer juste la conversationId
  }

  leaveConversation(conversationId: string) {
    this.socket.emit('leave_conversation', conversationId); // envoyer juste la conversationId
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.unsubscribeFromNewMessage();
    this.socket.disconnect();
  }
}