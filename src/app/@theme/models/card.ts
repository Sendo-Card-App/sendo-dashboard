import { PaginatedData } from ".";

export type OnboardingSessionStatus =
  | 'WAITING_FOR_INFORMATION'
  | 'UNDER_VERIFICATION'
  | 'VERIFIED'
  | 'REFUSED_TIMEOUT';

export interface SessionDocument {
  name: string;
  description?: string;
  files: SessionDocumentFile[];
}

export interface SessionDocumentFile {
  contentType: string; // ex: "image/jpeg"
  url: string;
  sequenceno: number;
}

export interface PartyInfo {
  idDocumentNumber: string;
  idDocumentType: string;
  firstName: string;
  familyName: string;
  birthDate: string; // ou Date
  nationality: string;
  gender: string; // ex: "M" ou "F"
}

export interface SessionLocation {
  type: string; // ex: "home", "work"
  country?: string;
  region?: string;
  department?: string;
  subdivision?: string;
  city?: string;
  neighborhood?: string;
}

export interface SessionType {
  user: {
    firstname?: string;
    lastname?: string;
    id: number;
    email: string;
    phone: string;
  };
  SessionParty: SessionParty;

}

export interface SessionParty {
  key: string;
  onboardingSessionStatus: OnboardingSessionStatus;
  documents: SessionDocument[];
  contactPoints: ContactPoint[];
  partyInfo: PartyInfo;
  locations: SessionLocation[];
  createdAt: string; // ou Date

}

export interface ContactPoint {
  type: string; // ex: "email", "phone"
  value: string;
  country?: string; // Pour les numéros de téléphone
}


export interface SessionPartyUserResponse {
  status: number;
  message: string;
  data: SessionParty[];
}

export interface KycDocument {
  id: number;
  type: 'ID_PROOF' | 'ADDRESS_PROOF' | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  url: string;
  publicId: string;
  idDocumentNumber: string | null;
  taxIdNumber: string | null;
  rejectionReason: string;
  reviewedById: number | null;
  userId: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type CardStatus =
  | 'PRE_ACTIVE'
  | 'ACTIVE'
  | 'FROZEN'
  | 'TERMINATED'
  | 'IN_TERMINATION'
  | 'SUSPENDED';

export interface VirtualCard {
  id: number;
  cardId: number;
  userId: number;
  cardName: string;
  partyId: string;
  last4Digits: string;
  expirationDate: string;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    wallet: {
      id: number;
      balance: number;
      currency: string;
      status: string;
      userId: number;
      matricule: string;
      createdAt: string;
      updatedAt: string;
    }
  }

}

export interface CardResponse {
  status: number;
  message: string;
  data: PaginatedData<VirtualCard>;
}

export interface CardTransactionResponse {
  status: number;
  message: string;
  data: {
    card: CardInfo;
    transactions: CardTransactionPagination;
  };
}

export interface CardInfo {
  id: number;
  cardId: number;
  cardName: string;
  partyId: string;
  last4Digits: string;
  expirationDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  paymentMethod: PaymentMethod;
}

export interface PaymentMethod {
  id: number;
  paymentMethodId: string;
  type: string;
  phone: string | null;
  userId: number;
  cardId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardTransactionPagination {
  page: number;
  totalPages: number;
  totalItems: number;
  items: CardTransaction[];
}

export interface CardTransaction {
  id: number;
  transactionId: string;
  amount: number;
  exchangeRates: number;
  sendoFees: number;
  currency: string;
  description: string | null;
  tva: number;
  partnerFees: number;
  totalAmount: number;
  type: string;
  status: string;
  receiverId: number | null;
  virtualCardId: number;
  method: string;
  provider: string | null;
  transactionReference: string;
  bankName: string | null;
  accountNumber: string | null;
  retryCount: number;
  lastChecked: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  };
  card: {
    id: number;
    cardId: number;
    status: string;
  };
}
