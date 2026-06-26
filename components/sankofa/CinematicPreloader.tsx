'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bebas_Neue } from 'next/font/google';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

type Props = {
  onEnter: () => void;
};

export function CinematicPreloader({ onEnter }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  const handleEnter = () => {
    setIsVisible(false);
    setTimeout(() => {
      onEnter();
    }, 1000); // Wait for fade out animation
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#0A0A0A',
            zIndex: 99999, // Above everything
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, letterSpacing: '0.1em', opacity: 0 }}
            animate={{ scale: 1, letterSpacing: '0.4em', opacity: 1 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className={bebas.className}
            style={{
              fontSize: 'clamp(2rem, 8vw, 6rem)',
              color: '#F4F0EA',
              textTransform: 'uppercase',
            }}
          >
            SANKOFA
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            onClick={handleEnter}
            className={bebas.className}
            data-cursor-expand="true"
            style={{
              marginTop: '60px',
              background: 'transparent',
              border: '1px solid rgba(244, 240, 234, 0.3)',
              color: '#F4F0EA',
              padding: '12px 32px',
              fontSize: '1.2rem',
              letterSpacing: '0.2em',
              cursor: 'none', // Handled by CustomCursor
              transition: 'background 0.3s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(244, 240, 234, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            ENTER ARCHIVE
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
