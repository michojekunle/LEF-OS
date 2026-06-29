'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence, useVelocity, useSpring, useMotionValueEvent, useMotionValue, useMotionTemplate, MotionValue } from 'framer-motion';
import Lenis from 'lenis';
import { Bebas_Neue, Cormorant_Garamond } from 'next/font/google';

import { CustomCursor } from '@/components/sankofa/CustomCursor';
import { MagneticButton } from '@/components/sankofa/MagneticButton';
import { CinematicPreloader } from '@/components/sankofa/CinematicPreloader';
import { SoundDesign } from '@/components/sankofa/SoundDesign';
import { Globe2, Landmark, Users, Lightbulb, Map, Coins } from 'lucide-react';

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '700'], style: ['normal', 'italic'] });

const DOMAINS = [
  { id: '01', name: 'Africa', icon: Map, question: 'AFRICA: THE CRADLE OR THE FUTURE?', shortDesc: 'Before the borders were drawn. The first universities, the wealth of Mali, the architectures of Zimbabwe.', statement: "What if the first economies weren't born in Europe? We reconstruct the economic ledgers of ancient kingdoms to understand the true origin of global trade." },
  { id: '02', name: 'World', icon: Globe2, question: 'THE WORLD AS IT IS, OR AS IT WAS WRITTEN?', shortDesc: 'Every civilization. Every era. Tracing the global trade routes that connected empires before the modern age.', statement: "History is written by the victors, but economics is written by the survivors. We trace the shifting centers of power from the Silk Road to the transatlantic exchange." },
  { id: '03', name: 'Economies', icon: Coins, question: 'HOW WAS THE WEALTH TRULY BUILT?', shortDesc: 'How wealth was built and stolen. The ledger of human progress is written in debt, resources, and innovation.', statement: "The modern financial system didn't emerge from a void. It was forged through extraction, innovation, and debt. We audit the ledgers of human progress." },
  { id: '04', name: 'Politics', icon: Landmark, question: 'POWER, POLICY, OR CONTROL?', shortDesc: 'Power, empire, resistance. How the structures of governance evolved and who they were designed to protect.', statement: "Governance is the art of institutionalizing power. We dissect the laws and treaties that were designed to protect the few and control the many." },
  { id: '05', name: 'People', icon: Users, question: 'WHO ARE THE FIGURES BEHIND THE FORCES?', shortDesc: "The figures behind the forces. History isn't a timeline of events, it is a web of human ambition and failure.", statement: "Behind every empire is an architect, and behind every collapse is a populace pushed too far. We profile the humans driving the mechanisms of power." },
  { id: '06', name: 'Ideas', icon: Lightbulb, question: 'WHAT JUSTIFIES THE CONQUEST?', shortDesc: 'Religion, science, and philosophy. The intellectual foundations that justified conquests and sparked revolutions.', statement: "Ideas are the blueprints of empires. From divine right to manifest destiny, we explore the intellectual foundations that justified both conquest and revolution." },
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

// Module-level state to track if preloader has run in the current session.
// This allows the splash screen to play on hard reloads (which resets bundle state)
// but bypasses it during Next.js client-side navigation.
let hasPlayedPreloader = false;

export default function SankofaPage() {
  const [mounted, setMounted] = useState(false);
  const [isArchiveEntered, setIsArchiveEntered] = useState(false);

  // Mount and preloader bypass check
  useEffect(() => {
    setMounted(true);
    if (hasPlayedPreloader) {
      setIsArchiveEntered(true);
    }
  }, []);

  // Smooth scroll - only initialize after archive is entered
  useEffect(() => {
    if (!isArchiveEntered) return;

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
  }, [isArchiveEntered]);

  // Shared scroll state
  const { scrollY, scrollYProgress } = useScroll();

  // Scroll Velocity Skew (Distortion Effect)
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocitySkew = useTransform(smoothVelocity, [-1000, 1000], [5, -5]);

  // Dynamic Background Transitions
  const backgroundColor = useTransform(scrollYProgress, [0, 0.05, 0.08], ['#F5F0E8', '#F5F0E8', '#0A0A0A']);
  const color = useTransform(scrollYProgress, [0, 0.05, 0.08], ['#1C1408', '#1C1408', '#F4F0EA']);

  // Marquee Parallax (Dual Band) & Text Scrubbing
  const introRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: introProgress } = useScroll({ target: introRef, offset: ["start end", "end start"] });
  const marquee1X = useTransform(introProgress, [0, 1], ['100%', '-100%']);
  const marquee2X = useTransform(introProgress, [0, 1], ['-100%', '100%']);
  
  // Staggered text timings (delayed until after background is fully dark at 0.2)
  const labelOpacity = useTransform(introProgress, [0.1, 0.2, 0.8, 0.9], [0, 1, 1, 0]);
  const titleOpacity = useTransform(introProgress, [0.2, 0.3, 0.8, 0.9], [0, 1, 1, 0]);
  const descOpacity = useTransform(introProgress, [0.4, 0.5, 0.8, 0.9], [0, 1, 1, 0]);
  const descY = useTransform(introProgress, [0.4, 0.5], [30, 0]);
  const marqueeOpacity = useTransform(introProgress, [0.0, 0.3, 0.4, 0.9, 1.0], [0, 0, 1, 1, 0]);
  

  // Hero Parallax
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const imgY = useTransform(scrollY, [0, 1000], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Horizontal Scroll & Haptic Feedback
  const horizontalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: horizontalProgress } = useScroll({ target: horizontalRef, offset: ["start start", "end end"] });
  const totalSlides = DOMAINS.length * 2;
  const x = useTransform(horizontalProgress, [0, 1], ['0%', `-${((totalSlides - 1) * 100) / totalSlides}%`]);

  const prevDomainIndex = useRef(0);
  useMotionValueEvent(horizontalProgress, "change", (latest) => {
    const activeIndex = Math.round(latest * (totalSlides - 1));
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
      {!isArchiveEntered && (
        <CinematicPreloader
          onEnter={() => {
            setIsArchiveEntered(true);
            hasPlayedPreloader = true;
          }}
        />
      )}

      <motion.div 
        data-theme="sankofa" 
        className="sankofa-page" 
        style={{ 
          backgroundColor, 
          color,
          height: isArchiveEntered ? 'auto' : '100vh',
          overflow: isArchiveEntered ? 'unset' : 'hidden'
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
            <div className="sankofa-rotated-spine-wrapper">
              <div className="sankofa-def-text" style={{ textAlign: 'right' }}>
                ARCHIVE_01<br/>
                VOL. 2026
              </div>
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
        <motion.section ref={introRef} className="sankofa-intro-section" style={{ height: '300vh', padding: 0 }}>
          <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            <motion.div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '100%', display: 'flex', flexDirection: 'column', gap: '2vh', pointerEvents: 'none', zIndex: 0, opacity: marqueeOpacity }}>
              <motion.div style={{ x: marquee1X, skewX: velocitySkew }}>
                <div className={`sankofa-marquee-text ${bebas.className}`}>FRAGMENTED</div>
              </motion.div>
              <motion.div style={{ x: marquee2X, skewX: velocitySkew }}>
                <div className={`sankofa-marquee-text ${bebas.className}`}>SCATTERED</div>
              </motion.div>
            </motion.div>
            
            <div className="sankofa-intro-content" style={{ padding: '0 24px' }}>
              <motion.div style={{ opacity: labelOpacity }}>
                <div className={`sankofa-phase-label ${bebas.className}`} style={{ marginBottom: '20px', fontSize: '24px', color: '#c9ab70' }}>THE FRAGMENTED RECORD</div>
              </motion.div>
              <motion.h2 
                className={`sankofa-h2-editorial ${cormorant.className}`} 
                style={{ 
                  textAlign: 'left', 
                  margin: 0,
                  color: '#F4F0EA',
                  opacity: titleOpacity
                }}
              >
                {"History was not lost. It was scattered.".split(' ').map((word, wIdx, arr) => (
                  <ScrollWord
                    key={wIdx}
                    word={word}
                    index={wIdx}
                    total={arr.length}
                    progress={introProgress}
                  />
                ))}
              </motion.h2>
              <motion.p 
                className="sankofa-phase-desc" 
                style={{ 
                  marginTop: '40px', 
                  maxWidth: '800px', 
                  fontSize: '1.4rem',
                  color: '#F4F0EA',
                  opacity: descOpacity,
                  y: descY
                }}
              >
                The traditional narrative of human civilization is a curated timeline designed by empires. 
                Sankofa dismantles this linear approach. We are reconstructing the global archive through interconnected 
                domains—starting with Africa, moving through global economies, and tracking the raw flow of power and ideas.
              </motion.p>
            </div>
          </div>
        </motion.section>

        {/* 3. HORIZONTAL SCROLL DOMAINS */}
        <motion.div ref={horizontalRef} className="sankofa-horizontal-wrapper" style={{ height: `${DOMAINS.length * 2 * 100}vh` }}>
          <div className="sankofa-horizontal-sticky">
            <motion.div style={{ x, width: `${DOMAINS.length * 2 * 100}vw` }} className="sankofa-horizontal-container">
              {DOMAINS.map((d, index) => {
                const Icon = d.icon;
                const layoutALayouts = ['layout-left', 'layout-right', 'layout-center'];
                const layoutA = layoutALayouts[index % 3];
                const layoutB = index % 2 === 0 ? 'layout-split' : 'layout-inverted';
                
                // Add some random aesthetics based on index
                const yOffset = (index % 3) * 5;
                const rotation = index % 2 === 0 ? 2 : -2;

                return (
                  <React.Fragment key={d.id}>
                    {/* Slide A: Question and short desc */}
                    <motion.div className={`sankofa-domain-panel ${layoutA}`} style={{ skewX: velocitySkew, position: 'relative' }}>
                      {/* Random visual noise or aesthetic element */}
                      {index % 2 !== 0 && (
                        <div style={{ position: 'absolute', top: '10%', left: '5%', opacity: 0.05, fontSize: '20vw', fontFamily: 'monospace', zIndex: 0, transform: `rotate(${rotation}deg)` }}>
                          0{index + 1}
                        </div>
                      )}
                      {layoutA === 'layout-right' && <Icon className="sankofa-giant-icon" />}
                      <div className={`sankofa-domain-number ${bebas.className}`}>{d.id}</div>
                      <h3 className={`sankofa-domain-title ${cormorant.className}`} style={{ fontSize: 'clamp(3rem, 6vw, 8rem)', marginBottom: '1rem', textTransform: 'uppercase', zIndex: 10 }}>
                        {d.question}
                      </h3>
                      <p className="sankofa-domain-desc" style={{ zIndex: 10 }}>{d.shortDesc}</p>
                    </motion.div>
                    
                    {/* Slide B: Deep dive statement with tag */}
                    <motion.div className={`sankofa-domain-panel ${layoutB}`} style={{ skewX: velocitySkew }}>
                      {layoutB === 'layout-split' ? (
                        <>
                          <div className={`sankofa-phase-label ${bebas.className}`} style={{ fontSize: '24px' }}>{d.name}</div>
                          <h3 className={`sankofa-h2-editorial ${cormorant.className}`} style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 600, color: '#F4F0EA', maxWidth: '900px' }}>
                            {d.statement}
                          </h3>
                        </>
                      ) : (
                        <>
                          <div className={`sankofa-phase-label ${bebas.className}`} style={{ marginBottom: '1.5rem', fontSize: '24px' }}>{d.name}</div>
                          <h3 className={`sankofa-h2-editorial ${cormorant.className}`} style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 600, maxWidth: '900px' }}>
                            {d.statement}
                          </h3>
                        </>
                      )}
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* 4. THE DEPLOYMENT ROADMAP */}
        <section className="sankofa-roadmap-section">
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
                  <div className="sankofa-phase-label">Phase 01 — FAPEM</div>
                  <h3 className={`sankofa-phase-title ${cormorant.className}`}>The Foundation</h3>
                  <p className="sankofa-phase-desc" style={{ maxWidth: '800px' }}>
                    Activating the Waitlist. We are gathering the initial 10,000 historians, researchers, and early access members while finalizing the raw database architecture and UI framework.
                  </p>
                </div>
              </div>

              <div className="sankofa-roadmap-card">
                <div style={{ position: 'relative', zIndex: 20 }}>
                  <div className="sankofa-phase-label">Phase 02 — KORAE</div>
                  <h3 className={`sankofa-phase-title ${cormorant.className}`}>The Vault</h3>
                  <p className="sankofa-phase-desc" style={{ maxWidth: '800px' }}>
                    Opening the beta archive. This phase introduces daily curated stories, interactive 3D historical artifacts, and immersive brutalist reading experiences exclusively to waitlist members.
                  </p>
                </div>
              </div>

              <div className="sankofa-roadmap-card">
                <div style={{ position: 'relative', zIndex: 20 }}>
                  <div className="sankofa-phase-label">Phase 03 — AMANSAN</div>
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

interface ScrollWordProps {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

function ScrollWord({ word, index, total, progress }: ScrollWordProps) {
  const start = 0.2 + (index / total) * 0.05;
  const wordOpacity = useTransform(progress, [start, start + 0.05], [0, 1]);
  const wordY = useTransform(progress, [start, start + 0.05], [15, 0]);

  return (
    <motion.span
      style={{
        opacity: wordOpacity,
        y: wordY,
        display: 'inline-block',
        marginRight: '0.25em',
      }}
    >
      {word}
    </motion.span>
  );
}
