
import { WithdrawalMethod, AdOptionType } from './types';

export const API_BASE_URL = '/api'; // Adjust if your backend is on a different origin/path

// User Endpoints
export const USER_LOGIN_ENDPOINT = `${API_BASE_URL}/auth/telegram-login`;
export const USER_INFO_ENDPOINT = `${API_BASE_URL}/user`;
export const ADS_ENDPOINT = `${API_BASE_URL}/ads`;
export const TASKS_ENDPOINT = `${API_BASE_URL}/tasks`;
export const DEVICE_INFO_ENDPOINT = `${API_BASE_URL}/user/device-info`;
export const WITHDRAWAL_ENDPOINT = `${API_BASE_URL}/withdrawal`;
export const AD_VIEW_ENDPOINT = `${API_BASE_URL}/ads/view`;
export const TASK_COMPLETE_ENDPOINT = `${API_BASE_URL}/tasks/complete`;
export const TASK_HISTORY_ENDPOINT = `${API_BASE_URL}/user/task-history`;


// Admin Endpoints
export const ADMIN_LOGIN_ENDPOINT = `${API_BASE_URL}/admin/login`;
export const ADMIN_USERS_ENDPOINT = `${API_BASE_URL}/admin/users`;
export const ADMIN_ADS_ENDPOINT = `${API_BASE_URL}/admin/ads`;
export const ADMIN_TASKS_ENDPOINT = `${API_BASE_URL}/admin/tasks`;
export const ADMIN_WITHDRAWALS_ENDPOINT = `${API_BASE_URL}/admin/withdrawals`;
export const ADMIN_TRANSACTIONS_ENDPOINT = `${API_BASE_URL}/admin/transactions`;
export const ADMIN_SETTINGS_ENDPOINT = `${API_BASE_URL}/admin/settings`; // For setting earning/limits

// App Settings (These would ideally be fetched from the backend via ADMIN_SETTINGS_ENDPOINT)
export const AD_VIEW_TIMER_SECONDS = 10;
export const AD_EARNING_OPTION_1_DEFAULT = 0.01; // Earning per ad view for option 1
export const AD_EARNING_OPTION_2_DEFAULT = 0.02; // Earning per ad view for option 2
export const AD_LIMIT_OPTION_1_DEFAULT = 50;
export const AD_LIMIT_OPTION_2_DEFAULT = 100;
export const MIN_WITHDRAWAL_LIMIT_DEFAULT = 10; // Example minimum withdrawal amount

export const WITHDRAWAL_METHODS = [
  WithdrawalMethod.BKASH,
  WithdrawalMethod.NAGAD,
  WithdrawalMethod.BINANCE,
  WithdrawalMethod.CRYPTO,
];

export const AD_OPTIONS = [
  { type: AdOptionType.OPTION_1, label: 'Standard Ads', limit: AD_LIMIT_OPTION_1_DEFAULT },
  { type: AdOptionType.OPTION_2, label: 'Premium Ads', limit: AD_LIMIT_OPTION_2_DEFAULT },
];
    