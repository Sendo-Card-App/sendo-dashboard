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
  
export interface MeResponse {
    firstName?: string;
    lastName?: string;
    id: string;
    email: string;
    name: string;
    role: Role;
}

export interface Login {
    email: string;
    password: string;
}