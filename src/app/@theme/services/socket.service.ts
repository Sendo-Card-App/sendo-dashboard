import { Injectable, OnDestroy } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import {  Subject, takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private socket: Socket) {
  // this.socket.on('connect', () => {
  //   console.log('✅ Connected to socket:', this.socket.ioSocket.id);
  // });

  // this.socket.on('connect_error', (err: any) => {
  //   console.error('❌ Connection error:', err);
  // });

  // this.socket.on('disconnect', (reason: string) => {
  //   console.warn('⚠️ Disconnected:', reason);
  // });

   this.setupConnectionListeners();
    this.setupEventListeners();
}


  // test-websocket.component.ts
// testWebSocketConnection() {
//   const ws = new WebSocket('wss://api.sf-e.ca/api/?EIO=4&transport=websocket');

//   ws.onopen = () => console.log('WebSocket connected');
//   ws.onerror = (err) => console.error('WebSocket error', err);
//   ws.onclose = (event) => console.log('WebSocket closed', event);
// }

  private setupConnectionListeners() {
    this.socket.on('connect', () =>
      console.log('Socket connected:', this.socket.ioSocket.id));

    this.socket.on('disconnect', (reason: string) =>
      console.log('Socket disconnected:', reason));

    this.socket.on('connect_error', (err: Error) =>
      console.error('Socket connection error:', err));
  }

   private setupEventListeners() {

    this.socket.on('new_message', (msg) => {
      console.log('Nouveau message reçu:', msg);
    });


    this.socket.on('typing', (conversationId: string) => {
      console.log('User typing in:', conversationId);
    });

    this.socket.on('stop_typing', (conversationId: string) => {
      console.log('User stopped typing in:', conversationId);
    });
  }

sendMessage(data: { conversationId: string; content: string; attachments?: string[] }) {
  if (!this.socket.connected) {
    console.warn('⚠️ Socket not connected');
    return false;
  }

  console.log("📤 Envoi du message via socket:", data);
  this.socket.emit('send_message', data);
  return true;
}




  onNewMessage() {
    return this.socket.fromEvent('new_message').pipe(
      takeUntil(this.destroy$)
    );
  }

  joinConversation(conversationId: string) {
    this.socket.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.socket.emit('leave_conversation', { conversationId });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.socket.disconnect();
  }
}
