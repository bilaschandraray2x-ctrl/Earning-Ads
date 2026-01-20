
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false }) => {
  const defaultStyles = 'bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700';
  const hoverStyles = hoverable ? 'hover:shadow-indigo-500/20 hover:scale-[1.01] transition-all duration-300 ease-in-out' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${defaultStyles} ${hoverStyles} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
    