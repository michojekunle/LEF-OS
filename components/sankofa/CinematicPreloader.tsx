'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bebas_Neue } from 'next/font/google';
import { MousePointerClick } from 'lucide-react';

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

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: [0, -5, 0] }}
            transition={{
              opacity: { delay: 1.5, duration: 0.8 },
              y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 1.8 },
            }}
            style={{
              marginTop: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ color: '#c9ab70', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MousePointerClick size={20} style={{ color: '#c9ab70' }} />
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', fontFamily: 'monospace', color: '#c9ab70' }}>
                CLICK TO CONTINUE
              </span>
            </div>

            <motion.button
              onClick={handleEnter}
              className={bebas.className}
              data-cursor-expand="true"
              style={{
                background: 'rgba(201, 171, 112, 0.08)',
                border: '1px solid rgba(201, 171, 112, 0.4)',
                color: '#F4F0EA',
                padding: '12px 36px',
                fontSize: '1.25rem',
                letterSpacing: '0.2em',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(201, 171, 112, 0.2)';
                e.currentTarget.style.borderColor = '#c9ab70';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(201, 171, 112, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(201, 171, 112, 0.4)';
              }}
            >
              CONTINUE TO ARCHIVE
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
