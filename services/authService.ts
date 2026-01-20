
import { TelegramUser, User } from '../types';
import { USER_LOGIN_ENDPOINT, ADMIN_LOGIN_ENDPOINT } from '../constants';

// This is a placeholder service. In a real application,
// this would interact with your backend for authentication.

export const loginWithTelegram = async (telegramUser: TelegramUser): Promise<User> => {
  console.log('Attempting Telegram login with:', telegramUser);
  try {
    // In a real scenario, this would send telegramUser data to your backend
    // Your backend would then verify the hash, create/retrieve the user,
    // and return a session token or user object.
    const response = await fetch(USER_LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramUser),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Telegram login failed.');
    }

    const userData: User = await response.json();
    console.log('Telegram login successful:', userData);
    // You would typically store a token here, not the full user object
    // For this frontend demo, we store the user directly
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isAdmin', 'false'); // Always false for user login
    return userData;
  } catch (error) {
    console.error('Error during Telegram login:', error);
    throw error;
  }
};

export const adminLogin = async (username: string, password: string): Promise<User> => {
  console.log('Attempting admin login with:', username);
  try {
    // In a real scenario, this would send admin credentials to your backend
    // Your backend would authenticate the admin and return a session token/admin user object.
    const response = await fetch(ADMIN_LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Admin login failed.');
    }

    const adminData: User = await response.json(); // Admin user will have isAdmin true or a specific role
    console.log('Admin login successful:', adminData);
    localStorage.setItem('currentUser', JSON.stringify(adminData));
    localStorage.setItem('isAdmin', 'true');
    return adminData;
  } catch (error) {
    console.error('Error during admin login:', error);
    throw error;
  }
};

export const logout = () => {
  console.log('Logging out...');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isAdmin');
  // In a real app, you might also want to invalidate the session on the backend
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('currentUser');
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
};

export const isAdminLoggedIn = (): boolean => {
  return localStorage.getItem('isAdmin') === 'true';
};
    