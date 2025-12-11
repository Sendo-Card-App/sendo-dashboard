export interface LoginResponse {
    accessToken: string;
    deviceId: string;
}

export interface BaseResponse<T = unknown> {
  status: number;
  message: string;
  data: T
}

export interface BaseResponse2<T = unknown> {
  status: number;
  message: string;
  data: {
    user: MeResponse['user'];
    referralCode: {
      code: string;
      createdAt: string;
      updatedAt: string;
      id: number;
      isUsed: boolean;
      usedBy: T[];
      userId: number;
    };
  };
}


  export interface RolePayload {
    id: number;
    name: string;
  }

  export interface MeResponse<T = unknown> {
    user: {
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
      dateOfBirth: string | null;
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
    },
    referralCode: {
      code: string;
      createdAt: string;
      updatedAt: string;
      id: number;
      isUsed: boolean;
      usedBy: T[];
      userId: number;
    } | null;
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

// src/app/models/transaction.model.ts

export interface Transactions {
  id: number;
  transactionId: string;

  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  userId: number;
  receiverId?: number | null;

  user: MeResponse['user'];

  currency: string;
  virtualCardId?: number;
  totalAmount: number;
  exchangeRates?: number;
  sendoFees?: number;
  tva?: number;
  partnerFees?: number;
  description?: string;

  method?: 'MOBILE_MONEY' | 'BANK_TRANSFER' | null;
  provider?: 'MTN' | 'ORANGE' | null;
  transactionReference?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;

  createdAt: string;  // ISO date-time
  updatedAt: string;  // ISO date-time
}

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
export type TransactionType = 'DEPOSIT' | 'TRANSFER' | 'PAYMENT';

export interface RecentTransactions{
  transactionId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
}

/** Modèle minimal d’un document KYC */
export interface KycDocument {
  id: number;
  userId: number;
  user: MeResponse;
  type: string;
  status: string;
  createdAt: string;
  // etc.
}


export interface PaginatedData<T> {
  page: number;
  totalPages: number;
  totalItems: number;
   total: number;
  items: T[];
}

export interface UserKycData {
  kyc: KycDocument[];
  user: MeResponse;
}

export interface UserKycResponse {
  status: number;
  message: string;
  data: UserKycData;
}

export interface KycPendingResponse {
  status: number;
  message: string;
  data: PaginatedData<KycDocument>;
}

export interface RequestItem {
  id: number;
  type: string;
  status: RequestStatus;
  reviewedById: number | null;
  userId: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
  };
  reviewedBy: null | {
    id: number;
    firstname: string;
    lastname: string;
  };
}

export interface RequestsListResponse {
  status: number;
  message: string;
  data: PaginatedData<RequestItem>;
}

export type RequestStatus = 'PROCESSED' | 'UNPROCESSED' | 'REJECTED';

export interface Config {
  id: number;
  name: string;
  value: number;
  description: string;
  createdAt: string | null;
  updatedAt: string | null;
}


export interface Participant {
  userId: number;
  sharedExpenseId: number;
  part: number;
  paymentStatus: 'PENDING' | 'PAYED' | 'LATE'| 'REFUSED';// adapte selon tes valeurs possibles
  user: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

export interface SharedExpense {
  id: number;
  totalAmount: number;
  description: string;
  userId: number;
  initiatorPart: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  limitDate: string;
  methodCalculatingShare: string;
  createdAt: string;
  updatedAt: string;
  initiator: {
    id: number;
    firstname: string;
    lastname: string;
  };
  participants: Participant[];
}

export interface SharedExpenseResponse {
  message: string;
  data: PaginatedData<SharedExpense>;
}
export interface CancelSharedExpensePayload {
  cancelReason: string;
}

export interface PaginatedData<T> {
  page: number;
  totalPages: number;
  totalItems: number;
  items: T[];
}

export interface SharedResponseMessage {
  message: string;
}
// src/app/%40theme/models/fund-request.model.ts

export type FundRequestStatus = 'PENDING' | 'PARTIALLY_FUNDED' | 'FULLY_FUNDED' | 'CANCELLED';

export interface FundRequest {
 id: number;
  amount: number;
  description: string;
  deadline: string;
  status: FundRequestStatus;
  userId: number;
  reference: string;
  createdAt: string;
  updatedAt: string;
  recipients: {
    id: number;
    status: string;
    recipient: {
      id: number;
      firstname: string;
      lastname: string;
      email: string;
      phone: string;
    };
    payments: payment[];
  }[];

}

export interface payment {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  recipientId: number;
  fundRequestId: number;
}

export interface FundRequestListResponse {
 message: string;
  data:PaginatedData<FundRequest>;
}

export interface FundRequestQueryParams {
  page?: number;
  limit?: number;
  status?: FundRequestStatus;
  startDate?: string;
  endDate?: string;
}



export interface Membre {
  id: number;
  dateInscription: string;
  userId: number;
  role: 'ADMIN' | 'MEMBER';
  etat: 'ACTIVE' | 'INACTIVE';
  tontineId: number;
  createdAt: string;
  updatedAt: string;
  user: {
      firstname?: string;
      lastname?: string;
      id: number;
      email: string;
      phone: string;
    };
  penalites: [];
}

export interface CompteSequestre {
  id: number;
  soldeActuel: number;
  dateOuverture: string;
  etatCompte: 'ACTIVE' | 'INACTIVE';
  dateDernierMouvement: string | null;
  montantBloque: number;
  tontineId: number;
  responsableGestionId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TourDeDistribution {
  id: number;
  numeroDistribution: number;
  dateDistribution: string | null;
  montantDistribue: number | null;
  etat:  'PENDING' | 'SUCCESS' | 'BLOCKED' | string;
  justificatif: string | null;
  tontineId: number;
  beneficiaireId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tontine {
  ordreRotation: string;
  id: number;
  nom: string;
  type: 'FIXE' | 'VARIABLE' | string;
  frequence: 'WEEKLY' | 'MONTHLY' | string;
  description: string;
  montant: number;
  nombreMembres: number;
  modeVersement: 'AUTOMATIC' | 'MANUAL' | string;
  statutReglement: string | null;
  invitationCode: string;
  etat: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  membres: Membre[];
  cotisations:Cotisations[];
  compteSequestre: CompteSequestre;
  toursDeDistribution: TourDeDistribution[];
}

export interface Cotisations {
  id: number;
  dateCotisation: string;
  montant: number;
  methodePaiement: string;
  statutPaiement: string;
  justificatif: string;
  tourDistributionId: number | null;
  membreId: number;
  tontineId: number;
  createdAt: string;
  updatedAt: number;
}

export interface TontinePagination {
  page: number;
  totalPages: number;
  totalItems: number;
  items: Tontine[];
}

export interface TontineResponse {
  status: number;
  message: string;
  data: TontinePagination;
}

export interface TontineResponse1 {
  status: number;
  message: string;
  data: Tontine[];
}


export interface Publicite {
  id: number;
  name?: string;
  description?: string;
  imageUrl: string;
  price?: number;
  link?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PubliciteListResponse {
  status: number;
  message: string;
  data: PaginatedData<Publicite>;
}

export interface Debt {
  id: number;
  amount: number;
  userId: number;
  cardId: number;
  intitule: string;
  createdAt: string; // string car date renvoyée en ISO depuis l’API
  updatedAt: string;
  user: {
      firstname?: string;
      lastname?: string;
      id: number;
      email: string;
      phone: string;
      wallet: {
        balance: number;
        createdAt:string;
        currency: string;
        id: number;
        matricule: string;
        status: string;
        userId:number;
      }
    };
  card:{
    cardId: number;
    cardName: string;
    createdAt: string;
    expirationDate: string;
    last4Digits: string;
    paymentRejectNumber: number;
    status: string;
    id: number;
  }
}

export interface DebtResponse {
  status: number;
  message: string;
  data: {
    page: number;
    totalPages: number;
    totalItems: number;
    items: Debt[];
  };
}

export interface PartialPaymentDto {
  partialAmount: number;
  idCard?: number;
  userId?: number;
}

export interface CardBalanceResponse {
  status: number;
  message: string;
  data: {
    balance: number;
    currency?: string;
  };
}

export interface Transaction {
  id: number;
  transactionId: string;
  amount: number;
  exchangeRates: number;
  sendoFees: number;
  currency: string;
  description: string;
  tva: number;
  partnerFees: number;
  totalAmount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  receiverId: number;
  receiverType: string;
  virtualCardId: number | null;
  method: 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'VIRTUAL_CARD';
  provider: string;
  transactionReference: string;
  bankName: string | null;
  accountNumber: string | null;
  retryCount: number;
  lastChecked: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  card: any | null;
  wallet: {
    id: number;
    balance: number;
    currency: string;
    matricule: string;
  };
  receiver: {
    id: number;
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
  };
}
