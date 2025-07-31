import { Injectable, OnDestroy } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject, takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private socket: Socket) {
    this.setupConnectionListeners();
  }

  private setupConnectionListeners() {
    this.socket.on('connect', () => console.log('Socket connected:', this.socket.ioSocket.id));
    this.socket.on('disconnect', (reason: string) => console.log('Socket disconnected:', reason));
    this.socket.on('connect_error', (err: Error) => console.error('Socket connection error:', err.message));
  }

  sendMessage(data: { conversationId: string; content: string; attachments?: string[] }) {
    if (!this.socket.connected) {
      console.warn('Socket not connected - buffering message');
      // Possibilité bufferisation
    }
    this.socket.emit('send_message', data);
  }

  onNewMessage() {
    return this.socket.fromEvent('new_message').pipe(takeUntil(this.destroy$));
  }

  joinConversation(conversationId: string) {
    this.socket.emit('join_conversation', conversationId);  // envoyer la string directement !
  }

  leaveConversation(conversationId: string) {
    this.socket.emit('leave_conversation', conversationId);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.socket.disconnect();
  }
}