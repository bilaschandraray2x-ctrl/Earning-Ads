
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import Button from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarLinks = [
  { name: 'Users', path: '/admin/users' },
  { name: 'Ads', path: '/admin/ads' },
  { name: 'Tasks', path: '/admin/tasks' },
  { name: 'Withdrawals', path: '/admin/withdrawals' },
  { name: 'Transactions', path: '/admin/transactions' },
  // Additional admin settings could go here
];

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!admin) {
    // Should ideally be handled by ProtectedAdminRoute, but as a fallback
    return null;
  }

  const headerTitle = sidebarLinks.find(link => location.pathname.startsWith(link.path))?.name || 'Admin Dashboard';

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: isSidebarOpen ? 0 : -250 }}
        transition={{ type: 'tween', duration: 0.3 }}
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-6 flex flex-col z-40 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-red-400">Admin Panel</h2>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-8 text-center text-lg font-semibold text-gray-200">Welcome, Admin!</p>

        <nav className="flex-grow">
          <ul>
            {sidebarLinks.map((link) => (
              <li key={link.path} className="mb-2">
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors duration-200 ${
                      isActive ? 'bg-red-700 text-white shadow-md' : ''
                    }`
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="ml-3 font-medium">{link.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto">
          <Button variant="danger" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile Header */}
        <header className="bg-gray-800 p-4 flex items-center justify-between shadow-lg lg:hidden">
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-100">{headerTitle}</h1>
          <div className="w-6"></div> {/* Placeholder for alignment */}
        </header>

        {/* Backdrop for mobile sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
    