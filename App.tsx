
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/user/LoginPage';
import DashboardLayout from './pages/user/DashboardLayout';
import AdsToEarnPage from './pages/user/AdsToEarnPage';
import TasksPage from './pages/user/TasksPage';
import DeviceInfoPage from './pages/user/DeviceInfoPage';
import WithdrawalPage from './pages/user/WithdrawalPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import AdsManagementPage from './pages/admin/AdsManagementPage';
import TasksManagementPage from './pages/admin/TasksManagementPage';
import WithdrawalsReviewPage from './pages/admin/WithdrawalsReviewPage';
import TransactionHistoryPage from './pages/admin/TransactionHistoryPage';
import { User } from './types'; // Assuming User type is defined
import { AnimatePresence, motion } from 'framer-motion';

// Mock Auth Context - In a real app, this would manage user state and provide methods
interface AuthContextType {
  user: User | null;
  admin: boolean;
  login: (userData: User, isAdmin?: boolean) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Simulate checking for a logged-in user on mount
    const storedUser = localStorage.getItem('currentUser');
    const storedAdmin = localStorage.getItem('isAdmin');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setAdmin(storedAdmin === 'true');
    }
  }, []);

  const login = (userData: User, isAdmin: boolean = false) => {
    setUser(userData);
    setAdmin(isAdmin);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('isAdmin', String(isAdmin));
  };

  const logout = () => {
    setUser(null);
    setAdmin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{ user, admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected routes for users
const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, admin } = useAuth();
  if (!user || admin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Protected routes for admins
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin } = useAuth();
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes>
            {/* User Website Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedUserRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="ads" element={<AdsToEarnPage />} />
                      <Route path="tasks" element={<TasksPage />} />
                      <Route path="device-info" element={<DeviceInfoPage />} />
                      <Route path="withdrawal" element={<WithdrawalPage />} />
                      <Route path="*" element={<Navigate to="ads" replace />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedUserRoute>
              }
            />

            {/* Admin Panel Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardLayout>
                    <Routes>
                      <Route path="users" element={<UsersManagementPage />} />
                      <Route path="ads" element={<AdsManagementPage />} />
                      <Route path="tasks" element={<TasksManagementPage />} />
                      <Route path="withdrawals" element={<WithdrawalsReviewPage />} />
                      <Route path="transactions" element={<TransactionHistoryPage />} />
                      <Route path="*" element={<Navigate to="users" replace />} />
                    </Routes>
                  </AdminDashboardLayout>
                </ProtectedAdminRoute>
              }
            />

            {/* Catch-all for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
    