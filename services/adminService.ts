
import { User, Ad, Task, Withdrawal, Transaction, AdOptionType } from '../types';
import {
  ADMIN_USERS_ENDPOINT,
  ADMIN_ADS_ENDPOINT,
  ADMIN_TASKS_ENDPOINT,
  ADMIN_WITHDRAWALS_ENDPOINT,
  ADMIN_TRANSACTIONS_ENDPOINT,
  ADMIN_SETTINGS_ENDPOINT
} from '../constants';

// This is a placeholder service. In a real application,
// this would interact with your backend for admin functionalities.

const getAdminToken = () => {
  // In a real app, retrieve admin JWT or session token from localStorage/cookies
  return localStorage.getItem('adminToken'); // Example
};

const fetchAdminApi = async (url: string, options: RequestInit = {}) => {
  const token = getAdminToken();
  if (!token) {
    throw new Error('Admin not authenticated.');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Admin API error: ${response.status}`);
  }

  return response.json();
};

// --- User Management ---
export const getAllUsers = async (): Promise<User[]> => {
  console.log('Admin fetching all users.');
  return fetchAdminApi(ADMIN_USERS_ENDPOINT);
};

export const banUser = async (userId: string): Promise<{ success: boolean }> => {
  console.log(`Admin banning user ${userId}.`);
  return fetchAdminApi(`${ADMIN_USERS_ENDPOINT}/${userId}/ban`, { method: 'POST' });
};

export const unbanUser = async (userId: string): Promise<{ success: boolean }> => {
  console.log(`Admin unbanning user ${userId}.`);
  return fetchAdminApi(`${ADMIN_USERS_ENDPOINT}/${userId}/unban`, { method: 'POST' });
};

export const getUserDetailsForAdmin = async (userId: string): Promise<User> => {
  console.log(`Admin fetching details for user ${userId}.`);
  return fetchAdminApi(`${ADMIN_USERS_ENDPOINT}/${userId}`);
};

// --- Ad Management ---
export const getAllAds = async (): Promise<Ad[]> => {
  console.log('Admin fetching all ads.');
  return fetchAdminApi(ADMIN_ADS_ENDPOINT);
};

export const addAd = async (ad: Omit<Ad, 'id' | 'createdAt' | 'isActive'>): Promise<Ad> => {
  console.log('Admin adding new ad:', ad);
  return fetchAdminApi(ADMIN_ADS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(ad),
  });
};

export const updateAd = async (adId: string, updates: Partial<Ad>): Promise<Ad> => {
  console.log(`Admin updating ad ${adId}:`, updates);
  return fetchAdminApi(`${ADMIN_ADS_ENDPOINT}/${adId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteAd = async (adId: string): Promise<{ success: boolean }> => {
  console.log(`Admin deleting ad ${adId}.`);
  return fetchAdminApi(`${ADMIN_ADS_ENDPOINT}/${adId}`, { method: 'DELETE' });
};

// --- Task Management ---
export const getAllTasks = async (): Promise<Task[]> => {
  console.log('Admin fetching all tasks.');
  return fetchAdminApi(ADMIN_TASKS_ENDPOINT);
};

export const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'status'>): Promise<Task> => {
  console.log('Admin adding new task:', task);
  return fetchAdminApi(ADMIN_TASKS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(task),
  });
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
  console.log(`Admin updating task ${taskId}:`, updates);
  return fetchAdminApi(`${ADMIN_TASKS_ENDPOINT}/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteTask = async (taskId: string): Promise<{ success: boolean }> => {
  console.log(`Admin deleting task ${taskId}.`);
  return fetchAdminApi(`${ADMIN_TASKS_ENDPOINT}/${taskId}`, { method: 'DELETE' });
};

// --- Withdrawal Review ---
export const getPendingWithdrawals = async (): Promise<Withdrawal[]> => {
  console.log('Admin fetching pending withdrawals.');
  return fetchAdminApi(`${ADMIN_WITHDRAWALS_ENDPOINT}?status=pending`);
};

export const approveWithdrawal = async (withdrawalId: string): Promise<{ success: boolean }> => {
  console.log(`Admin approving withdrawal ${withdrawalId}.`);
  return fetchAdminApi(`${ADMIN_WITHDRAWALS_ENDPOINT}/${withdrawalId}/approve`, { method: 'POST' });
};

export const rejectWithdrawal = async (withdrawalId: string, reason: string): Promise<{ success: boolean }> => {
  console.log(`Admin rejecting withdrawal ${withdrawalId}. Reason: ${reason}`);
  return fetchAdminApi(`${ADMIN_WITHDRAWALS_ENDPOINT}/${withdrawalId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// --- Transaction History ---
export const getFullTransactionHistory = async (): Promise<Transaction[]> => {
  console.log('Admin fetching full transaction history.');
  return fetchAdminApi(ADMIN_TRANSACTIONS_ENDPOINT);
};

// --- Settings Management ---
export const getPlatformSettings = async (): Promise<{
  earningPerAd1: number;
  earningPerAd2: number;
  dailyLimit1: number;
  dailyLimit2: number;
  minWithdrawal: number;
}> => {
  console.log('Admin fetching platform settings.');
  return fetchAdminApi(ADMIN_SETTINGS_ENDPOINT);
};

export const updatePlatformSettings = async (settings: {
  earningPerAd1?: number;
  earningPerAd2?: number;
  dailyLimit1?: number;
  dailyLimit2?: number;
  minWithdrawal?: number;
}): Promise<{ success: boolean }> => {
  console.log('Admin updating platform settings:', settings);
  return fetchAdminApi(ADMIN_SETTINGS_ENDPOINT, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};
    