
import React from 'react';
import { motion, Variants } from 'framer-motion'; // Removed RepeatType import

const AnimatedBackground: React.FC = () => {
  const numParticles = 10; // Number of floating particles

  // Explicitly type particleVariants as Variants
  const particleVariants: Variants = {
    initial: (i: number) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      scale: Math.random() * 0.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
    }),
    animate: (i: number) => ({
      x: [
        Math.random() * window.innerWidth,
        Math.random() * window.innerWidth,
        Math.random() * window.innerWidth,
      ],
      y: [
        Math.random() * window.innerHeight,
        Math.random() * window.innerHeight,
        Math.random() * window.innerHeight,
      ],
      scale: [
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.5 + 0.5,
      ],
      opacity: [
        Math.random() * 0.3 + 0.1,
        Math.random() * 0.3 + 0.1,
        Math.random() * 0.3 + 0.1,
      ],
      transition: {
        duration: Math.random() * 20 + 20, // 20-40 seconds
        repeat: Infinity,
        repeatType: 'reverse', // Corrected to use string literal
        ease: 'easeInOut',
        delay: i * 0.5, // Staggered start
      },
    }),
  };

  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {Array.from({ length: numParticles }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-indigo-500 blur-2xl opacity-30"
          style={{
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
          }}
          variants={particleVariants}
          initial="initial"
          animate="animate"
          custom={i}
        />
      ))}
       {/* Gradient Overlay for modern feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-blue-900/20 to-purple-900/20 opacity-50"></div>
    </div>
  );
};

export default AnimatedBackground;
    