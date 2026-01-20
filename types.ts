
export interface User {
  id: string;
  telegramId: string;
  username: string;
  balance: number;
  dailyAdsWatched: number;
  dailyAdsLimit: number; // For option 1 or 2
  adOption: AdOptionType;
  deviceInfo?: DeviceInfo;
  securityStatus?: SecurityStatus;
  isBanned: boolean;
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  adLink: string;
  earningPerView: number;
  type: AdOptionType; // e.g., 'option1' or 'option2'
  isActive: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  earning: number;
  status: TaskStatus;
  link?: string; // Optional link for external task
  adminNotes?: string;
  userNotes?: string;
  createdAt: string;
}

export interface AdViewHistory {
  id: string;
  userId: string;
  adId: string;
  viewedAt: string;
  earning: number;
}

export interface TaskCompletion {
  id: string;
  userId: string;
  taskId: string;
  completedAt: string;
  earning: number;
  status: TaskCompletionStatus;
  submissionDetails?: string; // e.g., screenshot URL, text proof
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: WithdrawalMethod;
  details: string; // e.g., Bkash number, Nagad number, Binance email, Crypto address
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: string;
  relatedEntityId?: string; // Link to AdView, TaskCompletion, Withdrawal
}

export interface DeviceInfo {
  ipAddress: string;
  browser: string;
  os: string;
  deviceFingerprint: string;
  vpnDetected: boolean;
  proxyDetected: boolean;
  emulatorDetected: boolean;
  multipleAccountsDetected: boolean;
  lastLoginAt: string;
  blockedAttempts?: number;
}

export interface SecurityStatus {
  status: 'Safe' | 'Warning' | 'Blocked';
  reasons: string[];
}

export enum AdOptionType {
  OPTION_1 = 'option1', // Daily limit: 50 ads
  OPTION_2 = 'option2', // Daily limit: 100 ads
}

export enum TaskStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed', // For internal use after admin review
}

export enum TaskCompletionStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum WithdrawalMethod {
  BKASH = 'Bkash',
  NAGAD = 'Nagad',
  BINANCE = 'Binance',
  CRYPTO = 'Crypto Currency Network',
}

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TransactionType {
  AD_EARNING = 'ad_earning',
  TASK_EARNING = 'task_earning',
  WITHDRAWAL_REQUEST = 'withdrawal_request',
  WITHDRAWAL_APPROVED = 'withdrawal_approved',
  WITHDRAWAL_REJECTED = 'withdrawal_rejected',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

// Telegram User data from Login Widget
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}
    