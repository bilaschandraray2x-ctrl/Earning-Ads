import { User, Ad, Task, Withdrawal, DeviceInfo, AdViewHistory, TaskCompletion, WithdrawalMethod } from '../types';
import {
  USER_INFO_ENDPOINT,
  ADS_ENDPOINT,
  TASKS_ENDPOINT,
  AD_VIEW_ENDPOINT,
  TASK_COMPLETE_ENDPOINT,
  TASK_HISTORY_ENDPOINT,
  WITHDRAWAL_ENDPOINT,
  DEVICE_INFO_ENDPOINT
} from '../constants';

// This is a placeholder service. In a real application,
// this would interact with your backend to fetch/update data.

const getToken = () => {
  // In a real app, retrieve JWT or session token from localStorage/cookies
  return localStorage.getItem('userToken'); // Example
};

const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
};

export const getUserInfo = async (userId: string): Promise<User> => {
  console.log(`Fetching user info for ${userId}`);
  // Mock data or actual API call
  return fetchApi(`${USER_INFO_ENDPOINT}/${userId}`);
};

export const getAds = async (adOptionType?: string): Promise<Ad[]> => {
  console.log(`Fetching ads for option: ${adOptionType}`);
  // Mock data or actual API call
  const url = adOptionType ? `${ADS_ENDPOINT}?type=${adOptionType}` : ADS_ENDPOINT;
  return fetchApi(url);
};

export const viewAd = async (adId: string, userId: string): Promise<{ success: boolean; newBalance: number }> => {
  console.log(`User ${userId} viewing ad ${adId}`);
  // Mock data or actual API call
  return fetchApi(AD_VIEW_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ adId, userId }),
  });
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  console.log(`Fetching tasks for user ${userId}`);
  // Mock data or actual API call
  return fetchApi(`${TASKS_ENDPOINT}?userId=${userId}`);
};

export const completeTask = async (
  taskId: string,
  userId: string,
  submissionDetails?: string,
): Promise<{ success: boolean; newBalance: number; taskCompletion: TaskCompletion }> => {
  console.log(`User ${userId} completing task ${taskId}`);
  // Mock data or actual API call
  return fetchApi(TASK_COMPLETE_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ taskId, userId, submissionDetails }),
  });
};

export const getTaskHistory = async (userId: string): Promise<TaskCompletion[]> => {
  console.log(`Fetching task history for user ${userId}`);
  // Mock data or actual API call
  return fetchApi(`${TASK_HISTORY_ENDPOINT}?userId=${userId}`);
};

export const getDeviceInfo = async (userId: string): Promise<DeviceInfo> => {
  console.log(`Fetching device info for user ${userId}`);
  // In a real scenario, this would be a server-side endpoint that processes
  // client-side fingerprinting data and its own server-side IP/VPN detection.
  // For this frontend, it will return client-side derived info.
  // **This part needs robust backend implementation for security.**
  const response = await fetch(DEVICE_INFO_ENDPOINT, {
    method: 'POST', // Send some client-side data for backend analysis
    body: JSON.stringify({
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      // Add more client-side signals here
    }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  const data: DeviceInfo = await response.json();
  return data;
};

export const requestWithdrawal = async (
  userId: string,
  amount: number,
  method: WithdrawalMethod,
  details: string,
): Promise<{ success: boolean; withdrawalId: string }> => {
  console.log(`User ${userId} requesting withdrawal: ${amount} via ${method}`);
  // Mock data or actual API call
  return fetchApi(WITHDRAWAL_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ userId, amount, method, details }),
  });
};

export const getWithdrawalHistory = async (userId: string): Promise<Withdrawal[]> => {
  console.log(`Fetching withdrawal history for user ${userId}`);
  // Mock data or actual API call
  return fetchApi(`${WITHDRAWAL_ENDPOINT}?userId=${userId}`);
};

export const getAdViewHistory = async (userId: string): Promise<AdViewHistory[]> => {
  console.log(`Fetching ad view history for user ${userId}`);
  // Mock data or actual API call
  return fetchApi(`${AD_VIEW_ENDPOINT}/history?userId=${userId}`);
};