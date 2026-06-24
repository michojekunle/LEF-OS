'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { Bebas_Neue, Cormorant_Garamond } from 'next/font/google';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '700'], style: ['normal', 'italic'] });

const DOMAINS = [
  { id: '01', name: 'Africa', desc: "The continent they didn't teach you." },
  { id: '02', name: 'World', desc: 'Every civilization. Every era.' },
  { id: '03', name: 'Economies', desc: 'How wealth was built and stolen.' },
  { id: '04', name: 'Politics', desc: 'Power, empire, resistance.' },
  { id: '05', name: 'People', desc: 'The figures behind the forces.' },
  { id: '06', name: 'Ideas', desc: 'Religion, science, and philosophy.' },
];

export default function SankofaPage() {
  const [mounted, setMounted] = useState(false);

  // Smooth scroll
  useEffect(() => {
    setMounted(true);
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  // Root scroll logic for colors
  const { scrollYProgress } = useScroll();
  const backgroundColor = useTransform(scrollYProgress, [0, 0.4, 0.6], ['#F5F0E8', '#F5F0E8', '#0A0A0A']);
  const color = useTransform(scrollYProgress, [0, 0.4, 0.6], ['#1C1408', '#1C1408', '#F4F0EA']);

  // Hero Parallax
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const imgY = useTransform(scrollY, [0, 1000], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Horizontal Scroll (Dynamic mapping to calc(-100% + 100vw))
  const horizontalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: horizontalProgress } = useScroll({ target: horizontalRef, offset: ["start start", "end end"] });
  const x = useTransform(horizontalProgress, [0, 1], ['0%', 'calc(-100% + 100vw)']);

  // Waitlist State
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || formState === 'loading') return;
    setFormState('loading');
    setTimeout(() => setFormState('success'), 1000); // Simulate
  };

  if (!mounted) return null;

  return (
    <motion.div data-theme="sankofa" className={`sankofa-page`} style={{ backgroundColor, color }}>
      
      {/* 1. HERO - MASSIVE TYPOGRAPHY */}
      <section className="sankofa-hero-awwwards">
        <motion.div style={{ y: imgY }} className="sankofa-hero-floating-img">
          {/* Previous hero image on parchment */}
          <img src="/sankofa-hero.png" alt="Sankofa Artifact" style={{ width: '100%', display: 'block' }} />
        </motion.div>
        
        {/* Reverted to Cormorant Garamond per user request */}
        <motion.h1 style={{ y: heroY, opacity: heroOpacity }} className={`sankofa-h1-massive ${cormorant.className}`}>
          SANKOFA
        </motion.h1>
      </section>

      {/* 2. EDITORIAL STATEMENT */}
      <section className="sankofa-statement-section">
        <motion.h2 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={`sankofa-h2-editorial ${cormorant.className}`}
        >
          Every day, one true story.<br/><br/>
          <span style={{ opacity: 0.6, fontStyle: 'italic' }}>
            A daily practice in world history. Africa, civilizations, empires, economies, and the people who shaped them all.
          </span>
        </motion.h2>
      </section>

      {/* 3. HORIZONTAL SCROLL DOMAINS */}
      <div ref={horizontalRef} className="sankofa-horizontal-wrapper">
        <div className="sankofa-horizontal-sticky">
          <motion.div style={{ x }} className="sankofa-horizontal-container">
            {DOMAINS.map((d, i) => (
              <div key={d.id} className="sankofa-domain-minimal">
                <div className={`sankofa-domain-number ${bebas.className}`}>{d.id}</div>
                <h3 className={`sankofa-domain-title ${cormorant.className}`}>{d.name}</h3>
                <p className="sankofa-body-minimal">{d.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 4. BRUTALIST WAITLIST */}
      <section className="sankofa-waitlist-awwwards">
        {/* New isolated bird used here with mix-blend-mode: lighten in CSS */}
        <img src="/sankofa-bird-isolated.png" alt="Sankofa Obsidan Bird" className="sankofa-isolated-bird" />
        
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className={`sankofa-h1-massive ${bebas.className}`}
          style={{ fontSize: 'clamp(3rem, 10vw, 10rem)', zIndex: 2 }}
        >
          BE THE GRIOT
        </motion.h2>

        <div style={{ width: '100%', maxWidth: '600px', marginTop: '40px', zIndex: 2 }}>
          <AnimatePresence mode="wait">
            {formState === 'success' ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sankofa-body-minimal"
              >
                The archive awaits. You are on the list.
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit} 
                className="sankofa-form-brutalist"
              >
                <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL" 
                  className={`sankofa-input-brutalist ${cormorant.className}`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className={`sankofa-btn-brutalist ${bebas.className}`}>
                  {formState === 'loading' ? 'WAIT...' : 'JOIN'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <Link href="/" className="sankofa-body-minimal" style={{ marginTop: '100px', textDecoration: 'none', zIndex: 2 }}>
          ← RETURN TO LEF-OS
        </Link>
      </section>

    </motion.div>
  );
}
