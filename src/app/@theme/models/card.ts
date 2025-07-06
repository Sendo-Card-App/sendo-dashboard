export interface PartyInfo {
  firstName: string;
  familyName: string;
  birthDate: string;
  idDocumentType: string;
  idDocumentNumber: string;
  taxIdNumber: string;
  nationality: string;
}

export interface Location {
  address1: string;
  address2: string;
  address3: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
  longitude: number | null;
  latitude: number | null;
  type: string;
}

export interface ContactPoint {
  type: 'PHONENUMBER' | 'EMAIL';
  country: string | null;
  value: string;
  contextualCode: string | null;
}

export interface Capacity {
  code: string;
  enabled: boolean;
}

export interface DocumentFile {
  sequenceno: number;
  header: string;
  contentType: string;
  size: number;
  url: string;
}

export interface Document {
  name: string;
  createDateTime: string;
  type: string;
  files: DocumentFile[];
}

export interface SessionPartyUser {
  key: string;
  operator_id: number;
  createdAt: string;
  name: string;
  onboardingSessionKey: string;
  onboardingSessionStatus: string;
  type: string;
  partyInfo: PartyInfo;
  isActive: boolean;
  isDeleted: boolean;
  locations: Location[];
  contactPoints: ContactPoint[];
  capacities: Capacity[];
  documents: Document[];
}

export interface SessionPartyUserResponse {
  status: number;
  message: string;
  data: SessionPartyUser[];
}
