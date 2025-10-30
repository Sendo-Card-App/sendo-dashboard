// merchant.interface.ts

export interface Wallet {
  id: number;
  balance: number;
  currency: string;
  status: string;
  matricule: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  isVerifiedEmail: boolean;
  phone: string;
  isVerifiedPhone: boolean;
  country: string;
  address: string;
  dateOfBirth: string;
  placeOfBirth: string;
  picture: string | null;
  status: string;
  profession: string | null;
  region: string | null;
  city: string | null;
  district: string | null;
  passcode: string | null;
  referralCode: string;
  referredBy: string | null;
  isVerifiedKYC: boolean;
  numberOfCardsCreated: number;
  numberFailureConnection: number;
  createdAt: string;
  updatedAt: string;
  wallet: Wallet;
  roles: Role[];
}

export interface MerchantItem {
  id: number;
  userId: number;
  typeAccount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface MerchantPagination {
  page: number;
  totalPages: number;
  totalItems: number;
  items: MerchantItem[];
}

export interface MerchantListResponse {
  status: number;
  message: string;
  data: MerchantPagination;
}

export interface MerchantResponse {
  status: number;
  message: string;
  data: MerchantItem;
}

export type MerchantStatus = 'ACTIVE' | 'REFUSED';
