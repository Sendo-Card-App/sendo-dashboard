

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

  export interface MeResponse<T = unknown> {
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
    createdAt: string;
    updatedAt: string;
    roles: RolePayload[]; // Tableau de rôles
    wallet: {
      id: number;
      balance: number;
      currency: string;
      matricule: string;
    };
    virtualCard: T | null;
    transactions: T[];
  }


export interface Login {
    email: string;
    password: string;
}

export interface InviteUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  roleId: number;
}

export interface InviteUserResponse {
  id: number;
  invitationSent: boolean;
  message?: string;
}

// confirm-dialog-data.interface.ts
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface RoleUser {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeUserStatusRequest {
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface RemoveRoleRequest {
  userId: number;
  roleId: number;
}
