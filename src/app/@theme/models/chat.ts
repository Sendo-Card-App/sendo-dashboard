import { PaginatedData } from ".";

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderType: 'ADMIN' | 'CUSTOMER';
  senderId: number;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStatusEvent {
  userId: number;
  status: 'online' | 'offline' | 'away';
}

export interface NewMessageEvent {
  conversationId: string;
  message: Message;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  senderType: 'ADMIN' | 'CUSTOMER';
}

export interface UpdateStatusPayload {
  status: string;
}

export interface MessageEvent {
  conversationId: string;
  message: Message;
}

export interface MessageUpdateEvent {
  messageId: string;
  conversationId: string;
  updates: Partial<Message>;
}

export interface MessageDeleteEvent {
  messageId: string;
  conversationId: string;
}

export interface SocketResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Conversation {
  id: string;
  userId: number;
  adminId: number | null;
  status: string; // exemple : "OPEN"
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  admin: null | {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}


export interface ConversationListResponse {
  status: number;
  message: string;
  data: PaginatedData<Conversation>;
}
