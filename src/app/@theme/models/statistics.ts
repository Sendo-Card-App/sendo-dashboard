
export interface UserStats {
  totalUsers: number;
  dailyRegistrations: { date: string; count: number }[];
  verificationStats: {
    email: number;
    phone: number;
    kyc: number;
  };
  geographicDistribution: { region: string | null; count: number }[];
  statusDistribution: { status: string; count: number }[];
}

export interface WalletTop {
  userId: number;
  balance: number;
}

/** Répartition par devise */
export interface CurrencyDistribution {
  currency: string;
  count: number;
}

/** Statistiques de portefeuille */
export interface WalletStats {
  totalWallets: number;
  totalBalance: number;
  averageBalance: number;
  topWallets: WalletTop[];
  currencyDistribution: CurrencyDistribution[];
}

/** Statistiques de transaction */
export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
  statusDistribution: { status: string; count: number }[];
  typeDistribution: { type: string; count: number }[];
  recentTransactions: {
    transactionId: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    createdAt: string;
  }[];
}

/** Statistiques de cartes */
export interface CardStats {
  totalCards: number;
  statusDistribution: { status: string; count: number }[];
  averageExpenditureCeiling: number;
  recentCards: []; // à typer si vous avez la structure
}

/** Statistiques de demandes NIU */
export interface RequestStats {
  totalRequests: number;
  typeDistribution: { type: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  recentRequests: {
    id: number;
    type: string;
    status: string;
    description: string;
    userId: number;
    reviewedById: number | null;
    createdAt: string;
  }[];
}

/** Répartition par rôle */
export interface RoleStat {
  name: string;
  userCount: number;
}

/** Ensemble des statistiques */
export interface StatisticsData {
  userStats: UserStats;
  walletStats: WalletStats;
  transactionStats: TransactionStats;
  cardStats: CardStats;
  sharedExpensesStats: SharedExpensesStats;
  requestStats: RequestStats;
  roleStats: RoleStat[];
  requestFundsStats: RequestFundsStats;
  tontineStats: TontineStats;
}

/** Réponse de l’API */
export interface StatisticsResponse {
  status: number;
  message: string;
  data: StatisticsData;
}

export interface DashboardSummaryItem {
  icon: string;
  background: string;
  title: string;
  value: string;
  percentage: string; // ou number si vous préférez travailler en nombre puis formatter en %
  color: string;
}

export interface CountsByType {
  DEPOSIT?: number;
  TRANSFER?: number;
  PAYMENT?: number;
}

// 2) Puis un type pour l’ensemble des dates
export type GroupedData = Record<string, CountsByType>;

export interface SharedExpenseStatusDistribution {
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  count: number;
}

export interface TopContributor {
  userId: number;
  totalContributed: number;
  user: {
    name: string;
    // Ajoutez d'autres propriétés utilisateur si nécessaire
    // email?: string;
    // avatar?: string;
  };
}

export interface RecentSharedExpense {
  id: number;
  totalAmount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  initiator: string;
  createdAt: string; // ou Date si vous convertissez les strings en Date
  // Ajoutez d'autres propriétés si nécessaire
  // participants?: number;
}

export interface SharedExpensesStats {
  totalSharedExpenses: number;
  averageParticipants: number;
  statusDistribution: SharedExpenseStatusDistribution[];
  totalAmountShared: number;
  topContributors: TopContributor[];
  recentSharedExpenses: RecentSharedExpense[];
  requestFundsStats: RequestFundsStats;
}

// Exemple d'interface pour la réponse complète si nécessaire
export interface SharedExpensesResponse {
  status: number;
  message: string;
  data: {
    sharedExpenses: SharedExpensesStats;
    // autres données potentielles...
  };
}


// Statut possible pour une demande de fonds
export type RequestFundStatus = 'FULLY_FUNDED' | 'CANCELLED';

// Répartition par statut
export interface RequestFundStatusDistribution {
  status: RequestFundStatus;
  count: number;
}

// Top demandeur de fonds
export interface TopRequester {
  userId: number;
  totalRequested: number;
  user: string; // nom complet
}

// Demande récente de fonds
export interface RecentRequestFund {
  id: number;
  amount: number;
  description: string;
  status: RequestFundStatus;
  requester: string;
  createdAt: string;
}

// Statistiques globales des demandes de fonds
export interface RequestFundsStats {
  total: number;
  statusDistribution: RequestFundStatusDistribution[];
  totalAmountRequested: number;
  topRequesters: TopRequester[];
  recent: RecentRequestFund[];
}


// Statut possible pour une tontine
export type TontineStatus = 'ACTIVE' | 'CLOSED' | 'INACTIVE'; // Ajoute d'autres statuts si besoin

// Répartition par statut
export interface TontineStatusDistribution {
  status: TontineStatus;
  count: number;
}

// Répartition par type de tontine
export type TontineType = 'FIXE' | 'ALEATOIRE';

export interface TontineTypeDistribution {
  type: TontineType;
  count: number;
}

// Participant principal
export interface TopTontineParticipant {
  totalCotise: number;
  // Ajoute d'autres propriétés si besoin (ex: userId, nom, etc.)
}

// Tontine récente
export interface RecentTontine {
  id: number;
  montantTotal: number;
  status: TontineStatus;
  createdAt: string;
}

// Statistiques globales des tontines
export interface TontineStats {
  totalTontines: number;
  totalAmount: number;
  averageAmount: number;
  statusDistribution: TontineStatusDistribution[];
  typeDistribution: TontineTypeDistribution[];
  topParticipants: TopTontineParticipant[];
  recentTontines: RecentTontine[];
}

