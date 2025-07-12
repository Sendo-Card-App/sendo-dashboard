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
