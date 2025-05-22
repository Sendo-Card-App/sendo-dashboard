
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
  requestStats: RequestStats;
  roleStats: RoleStat[];
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
