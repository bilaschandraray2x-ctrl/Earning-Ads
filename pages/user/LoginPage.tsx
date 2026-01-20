
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { loginWithTelegram } from '../../services/authService';
import { TelegramUser } from '../../types';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { motion } from 'framer-motion';

// Declare TelegramLoginWidget on the Window object
declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: TelegramUser) => void;
      // Other methods/properties if they exist, but dataOnauth is the primary one here.
    };
  }
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard/ads');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!window.TelegramLoginWidget) {
      // Create and append the Telegram Login Widget script if not present
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute('data-telegram-login', 'YOUR_BOT_USERNAME'); // <<<<<< IMPORTANT: Replace with your Telegram Bot Username
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '10');
      script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
      script.setAttribute('data-request-access', 'write');
      document.body.appendChild(script);

      window.TelegramLoginWidget = {
        dataOnauth: async (telegramUser: TelegramUser) => {
          setLoading(true);
          setError(null);
          try {
            const loggedInUser = await loginWithTelegram(telegramUser);
            login(loggedInUser, false); // Log in as a regular user
          } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setLoading(false);
          }
        },
      };
    }
    // Cleanup function for when the component unmounts
    return () => {
      // Optionally remove the script or clean up global function if necessary
      // For this simple case, leaving the script is fine, but good practice to consider.
    };
  }, [login]);

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
          <h1 className="text-4xl font-extrabold text-indigo-400 mb-6 drop-shadow-lg">
            Earning Ads
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Connect your Telegram to start earning!
          </p>

          <div id="telegram-login-button" className="flex justify-center mb-6">
            {/* The Telegram login widget will render here */}
            {loading && (
              <div className="flex items-center text-indigo-400 font-semibold">
                <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <p className="text-gray-500 text-sm mt-8">
            By logging in, you agree to our terms and conditions.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
    