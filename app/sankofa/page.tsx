'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence, useVelocity, useSpring, useMotionValueEvent, useMotionValue, useMotionTemplate } from 'framer-motion';
import Lenis from 'lenis';
import { Bebas_Neue, Cormorant_Garamond } from 'next/font/google';

import { CustomCursor } from '@/components/sankofa/CustomCursor';
import { MagneticButton } from '@/components/sankofa/MagneticButton';
import { CinematicPreloader } from '@/components/sankofa/CinematicPreloader';
import { SoundDesign } from '@/components/sankofa/SoundDesign';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '700'], style: ['normal', 'italic'] });

const DOMAINS = [
  { id: '01', name: 'Africa', desc: "Before the borders were drawn. The first universities, the wealth of Mali, the architectures of Zimbabwe. What if the first economies weren't born in Europe?" },
  { id: '02', name: 'World', desc: 'Every civilization. Every era. Tracing the global trade routes that connected empires before the modern age.' },
  { id: '03', name: 'Economies', desc: 'How wealth was built and stolen. The ledger of human progress is written in debt, resources, and innovation.' },
  { id: '04', name: 'Politics', desc: 'Power, empire, resistance. How the structures of governance evolved and who they were designed to protect.' },
  { id: '05', name: 'People', desc: "The figures behind the forces. History isn't a timeline of events, it is a web of human ambition and failure." },
  { id: '06', name: 'Ideas', desc: 'Religion, science, and philosophy. The intellectual foundations that justified conquests and sparked revolutions.' },
];

function useDeviceOrientation() {
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
  
  useEffect(() => {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) return;
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // beta: front/back tilt, gamma: left/right tilt
      setOrientation({
        beta: e.beta ? Math.max(-90, Math.min(90, e.beta)) : 0,
        gamma: e.gamma ? Math.max(-90, Math.min(90, e.gamma)) : 0,
      });
    };
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  return orientation;
}

export default function SankofaPage() {
  const [mounted, setMounted] = useState(false);
  const [isArchiveEntered, setIsArchiveEntered] = useState(false);

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

  // Shared scroll state
  const { scrollY, scrollYProgress } = useScroll();

  // Scroll Velocity Skew (Distortion Effect)
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocitySkew = useTransform(smoothVelocity, [-1000, 1000], [5, -5]);

  // Dynamic Background Transitions
  const backgroundColor = useTransform(scrollYProgress, [0, 0.05, 0.15], ['#F5F0E8', '#F5F0E8', '#0A0A0A']);
  const color = useTransform(scrollYProgress, [0, 0.05, 0.15], ['#1C1408', '#1C1408', '#F4F0EA']);

  // Marquee Parallax (Dual Band) & Text Scrubbing
  const introRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: introProgress } = useScroll({ target: introRef, offset: ["start end", "end start"] });
  const marquee1X = useTransform(introProgress, [0, 1], ['10vw', '-100vw']);
  const marquee2X = useTransform(introProgress, [0, 1], ['-100vw', '10vw']);
  

  
  // Sinking Tarot Cards Roadmap
  // Stripped out glitchy scale and shadow hooks for pure CSS stacking
  const roadmapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: roadmapProgress } = useScroll({ target: roadmapRef, offset: ["start start", "end end"] });

  // Hero Parallax
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const imgY = useTransform(scrollY, [0, 1000], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Horizontal Scroll & Haptic Feedback
  const horizontalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: horizontalProgress } = useScroll({ target: horizontalRef, offset: ["start start", "end end"] });
  const x = useTransform(horizontalProgress, [0, 1], ['0%', `-${((DOMAINS.length - 1) * 100) / DOMAINS.length}%`]);

  const prevDomainIndex = useRef(0);
  useMotionValueEvent(horizontalProgress, "change", (latest) => {
    const activeIndex = Math.round(latest * (DOMAINS.length - 1));
    if (activeIndex !== prevDomainIndex.current) {
      prevDomainIndex.current = activeIndex;
      // Trigger short physical vibration on mobile when snapping to a new domain
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
  });

  // Device Orientation (Gyroscope Parallax)
  const { beta, gamma } = useDeviceOrientation();
  // Map gamma (-45 to 45) to X offset, beta (-45 to 45) to Y offset
  const gyroX = useTransform(useSpring(gamma, { damping: 50, stiffness: 400 }), [-45, 45], [-30, 30]);
  const gyroY = useTransform(useSpring(beta, { damping: 50, stiffness: 400 }), [-45, 45], [-30, 30]);

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
    <>
      <CustomCursor />
      <SoundDesign isEnabled={isArchiveEntered} />
      <CinematicPreloader onEnter={() => setIsArchiveEntered(true)} />

      <motion.div 
        data-theme="sankofa" 
        className="sankofa-page" 
        style={{ 
          backgroundColor, 
          color,
          height: isArchiveEntered ? 'auto' : '100vh',
          overflow: isArchiveEntered ? 'visible' : 'hidden'
        }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Hide all LEF-OS global shells on this specific route */
            header, nav, footer, 
            .fixed.bottom-0, /* MobileTabBar */
            .fixed.bottom-4.right-4, /* LEFCounselPanel */
            [class*="lef-counsel"],
            [id*="lef-counsel"] {
              display: none !important;
            }
            /* Reset main padding */
            main {
              padding: 0 !important;
              min-height: 100vh !important;
              margin: 0 !important;
            }
          `
        }} />

        {/* 1. HERO - MASSIVE TYPOGRAPHY & METADATA */}
        <section className="sankofa-hero-awwwards">
          {/* Metadata Blocks */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isArchiveEntered ? 1 : 0, y: isArchiveEntered ? 0 : -20 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="sankofa-hero-meta sankofa-meta-tl"
          >
            <div className="sankofa-def-text">
              [san-ko-fa] · noun · origin: Akan<br/>
              <span style={{ fontStyle: 'italic', opacity: 0.8 }}>
                "It is not taboo to fetch what is at risk of being left behind."
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isArchiveEntered ? 1 : 0, y: isArchiveEntered ? 0 : -20 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="sankofa-hero-meta sankofa-meta-tr"
          >
            <div className="sankofa-def-text" style={{ textAlign: 'right' }}>
              ARCHIVE_01<br/>
              VOL. 2026
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isArchiveEntered ? 1 : 0, y: isArchiveEntered ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="sankofa-hero-meta sankofa-meta-bl"
          >
            <div className={`sankofa-manifesto-text ${cormorant.className}`}>
              A digital archive of global history, reconstructing the narratives of power, economy, and civilization.
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isArchiveEntered ? 1 : 0, y: isArchiveEntered ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="sankofa-hero-meta sankofa-meta-br"
          >
            <div className="sankofa-scroll-prompt">
              SCROLL TO EXPLORE
            </div>
          </motion.div>

          <motion.div style={{ y: imgY, x: gyroX, skewY: velocitySkew }} className="sankofa-hero-floating-img">
            <img src="/sankofa-hero.png" alt="Sankofa Artifact" style={{ width: '100%', display: 'block' }} />
          </motion.div>
          
          <motion.h1 style={{ y: heroY, x: gyroY, opacity: heroOpacity, skewY: velocitySkew }} className={`sankofa-h1-massive ${cormorant.className}`}>
            SANKOFA
          </motion.h1>
        </section>        {/* 2. THE INTRODUCTION */}
        <section ref={introRef} className="sankofa-intro-section" style={{ height: '300vh', padding: 0 }}>
          <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '100%', display: 'flex', flexDirection: 'column', gap: '2vh', pointerEvents: 'none', zIndex: 0 }}>
              <motion.div style={{ x: marquee1X, skewX: velocitySkew }}>
                <div className={`sankofa-marquee-text ${bebas.className}`}>FRAGMENTED</div>
              </motion.div>
              <motion.div style={{ x: marquee2X, skewX: velocitySkew }}>
                <div className={`sankofa-marquee-text ${bebas.className}`}>SCATTERED</div>
              </motion.div>
            </div>
            
            <div className="sankofa-intro-content" style={{ padding: '0 24px' }}>
              <motion.div style={{ opacity: useTransform(introProgress, [0.1, 0.2, 0.8, 0.9], [0, 1, 1, 0]) }}>
                <div className={`sankofa-phase-label ${bebas.className}`} style={{ marginBottom: '20px', fontSize: '24px', color: '#c9ab70' }}>THE FRAGMENTED RECORD</div>
              </motion.div>
              <motion.h2 
                className={`sankofa-h2-editorial ${cormorant.className}`} 
                style={{ 
                  textAlign: 'left', 
                  margin: 0,
                  color: '#F4F0EA',
                  opacity: useTransform(introProgress, [0.2, 0.3, 0.8, 0.9], [0, 1, 1, 0]),
                  y: useTransform(introProgress, [0.2, 0.3], [30, 0])
                }}
              >
                History was not lost. It was scattered.
              </motion.h2>
              <motion.p 
                className="sankofa-phase-desc" 
                style={{ 
                  marginTop: '40px', 
                  maxWidth: '800px', 
                  fontSize: '1.4rem',
                  color: '#F4F0EA',
                  opacity: useTransform(introProgress, [0.4, 0.5, 0.8, 0.9], [0, 1, 1, 0]),
                  y: useTransform(introProgress, [0.4, 0.5], [30, 0])
                }}
              >
                The traditional narrative of human civilization is a curated timeline designed by empires. 
                Sankofa dismantles this linear approach. We are reconstructing the global archive through interconnected 
                domains—starting with Africa, moving through global economies, and tracking the raw flow of power and ideas.
              </motion.p>
            </div>
          </div>
        </section>

        {/* 3. HORIZONTAL SCROLL DOMAINS */}
        <div ref={horizontalRef} className="sankofa-horizontal-wrapper" style={{ height: `${DOMAINS.length * 100}vh` }}>
          <div className="sankofa-horizontal-sticky">
            <motion.div style={{ x, width: `${DOMAINS.length * 100}vw` }} className="sankofa-horizontal-container">
              {DOMAINS.map((d) => (
                <motion.div key={d.id} className="sankofa-domain-panel" style={{ skewX: velocitySkew }}>
                  <div className={`sankofa-domain-number ${bebas.className}`}>{d.id}</div>
                  <h3 className={`sankofa-domain-title ${cormorant.className}`}>{d.name}</h3>
                  <p className="sankofa-domain-desc">{d.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* 4. THE DEPLOYMENT ROADMAP */}
        <section ref={roadmapRef} className="sankofa-roadmap-section">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1 }}
          >
            <h2 className={`sankofa-h1-massive ${cormorant.className}`} style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}>
              THE DEPLOYMENT
            </h2>
            
            <div className="sankofa-roadmap-grid">
              <div className="sankofa-roadmap-card">
                <div style={{ position: 'relative', zIndex: 20 }}>
                  <div className="sankofa-phase-label">Phase 01 — NOW</div>
                  <h3 className={`sankofa-phase-title ${cormorant.className}`}>The Foundation</h3>
                  <p className="sankofa-phase-desc" style={{ maxWidth: '800px' }}>
                    Activating the Waitlist. We are gathering the initial 10,000 historians, researchers, and early access members while finalizing the raw database architecture and UI framework.
                  </p>
                </div>
              </div>

              <div className="sankofa-roadmap-card">
                <div style={{ position: 'relative', zIndex: 20 }}>
                  <div className="sankofa-phase-label">Phase 02 — NEXT</div>
                  <h3 className={`sankofa-phase-title ${cormorant.className}`}>The Vault</h3>
                  <p className="sankofa-phase-desc" style={{ maxWidth: '800px' }}>
                    Opening the beta archive. This phase introduces daily curated stories, interactive 3D historical artifacts, and immersive brutalist reading experiences exclusively to waitlist members.
                  </p>
                </div>
              </div>

              <div className="sankofa-roadmap-card">
                <div style={{ position: 'relative', zIndex: 20 }}>
                  <div className="sankofa-phase-label">Phase 03 — FUTURE</div>
                  <h3 className={`sankofa-phase-title ${cormorant.className}`}>The Encyclopedia</h3>
                  <p className="sankofa-phase-desc" style={{ maxWidth: '800px' }}>
                    A fully decentralized, community-verified web of global historical interconnections. Users will be able to submit, verify, and trace the flow of power across civilizations in real-time.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 5. BRUTALIST WAITLIST */}
        <section className="sankofa-waitlist-awwwards">
          <motion.img 
            src="/sankofa-bird-isolated.png" 
            alt="Sankofa Obsidan Bird" 
            className="sankofa-isolated-bird" 
            style={{ skewX: velocitySkew }}
          />
          
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className={`sankofa-h1-massive ${bebas.className}`}
            style={{ fontSize: 'clamp(3rem, 10vw, 10rem)', zIndex: 2, skewY: velocitySkew }}
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
                  <MagneticButton type="submit">
                    <div className={`sankofa-btn-brutalist ${bebas.className}`}>
                      {formState === 'loading' ? 'WAIT...' : 'JOIN'}
                    </div>
                  </MagneticButton>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <Link href="/" className="sankofa-body-minimal" style={{ marginTop: '100px', textDecoration: 'none', zIndex: 2 }}>
            <MagneticButton>
              <div style={{ padding: '20px' }}>← RETURN TO LEF-OS</div>
            </MagneticButton>
          </Link>
        </section>

      </motion.div>
    </>
  );
}
