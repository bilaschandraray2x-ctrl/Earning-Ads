
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { adminLogin } from '../../services/authService';
import { motion } from 'framer-motion';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { admin, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      navigate('/admin/users'); // Redirect to admin dashboard if already logged in
    }
  }, [admin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // In a real scenario, replace mock admin user with actual backend authentication
      const adminUser = await adminLogin(username, password);
      if (adminUser) {
        login(adminUser, true); // Mark as admin
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full z-10"
      >
        <Card className="text-center bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg">
          <h1 className="text-4xl font-extrabold text-red-400 mb-6 drop-shadow-lg">
            Admin Panel Login
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Please log in with your admin credentials.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="admin-username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              id="admin-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Button type="submit" className="w-full mt-6" isLoading={loading} disabled={loading}>
              Login as Admin
            </Button>
          </form>

          {error && (
            <div className="mt-6">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
    