import { Role } from "../types/role";

export interface LoginResponse {
    accessToken: string;
    deviceId: string;
}

export interface BaseResponse {
    status: number;
    message: string;
    data: unknown;
}
  
export interface RolePayload {
    id: number;
    name: string;
  }
  
  export interface MeResponse {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    isVerifiedEmail: boolean;
    phone: string;
    address: string;
    profession: string | null;
    region: string | null;
    city: string | null;
    district: string | null;
    isVerifiedKYC: boolean;
    roleId: number;
    createdAt: string;    // ISO date
    updatedAt: string;    // ISO date
    role: RolePayload;    // objet role tel que renvoyé
    kycDocuments: any[];
    wallet: {
      id: number;
      balance: number;
      currency: string;
    };
    virtualCard: any | null;
    transactions: any[];
  }
  

export interface Login {
    email: string;
    password: string;
}