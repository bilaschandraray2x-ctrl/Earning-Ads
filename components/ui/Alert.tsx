
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  let bgColor = '';
  let textColor = '';
  let borderColor = '';

  switch (type) {
    case 'success':
      bgColor = 'bg-green-600';
      textColor = 'text-white';
      borderColor = 'border-green-700';
      break;
    case 'error':
      bgColor = 'bg-red-600';
      textColor = 'text-white';
      borderColor = 'border-red-700';
      break;
    case 'info':
      bgColor = 'bg-blue-600';
      textColor = 'text-white';
      borderColor = 'border-blue-700';
      break;
    case 'warning':
      bgColor = 'bg-yellow-600';
      textColor = 'text-white';
      borderColor = 'border-yellow-700';
      break;
  }

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`${bgColor} ${textColor} border ${borderColor} p-4 rounded-lg shadow-md flex justify-between items-center`}
        >
          <span>{message}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
    