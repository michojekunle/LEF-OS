'use client';

import { useEffect, useRef } from 'react';
import { useScroll } from 'framer-motion';

type Props = {
  isEnabled: boolean;
};

export function SoundDesign({ isEnabled }: Props) {
  const { scrollYProgress } = useScroll();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!isEnabled) return;

    // Initialize Web Audio API
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Master Volume
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0; // Starts silent (at top of page)
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Main Drone Oscillator (Low frequency sine wave)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 55; // Deep A1 note

    // LFO for throbbing cinematic feel
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // Very slow throb

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;

    lfo.connect(lfoGain);
    
    // Connect osc through an individual gain to apply LFO
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.5; // Base volume
    lfoGain.connect(oscGain.gain);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start();
    lfo.start();

    // Map scrollYProgress to Master Volume
    const unsubscribe = scrollYProgress.on('change', (v) => {
      if (!masterGainRef.current || !ctx) return;
      // We want audio to fade in as we scroll.
      // At top (0), gain is 0.
      // At bottom (1), gain is 0.3 (subtle).
      // We resume context if it was suspended (browser policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const newVolume = Math.min(v * 0.4, 0.4); 
      // Smoothly ramp to new volume
      masterGainRef.current.gain.setTargetAtTime(newVolume, ctx.currentTime, 0.1);
    });

    return () => {
      unsubscribe();
      osc.stop();
      lfo.stop();
      ctx.close();
    };
  }, [isEnabled, scrollYProgress]);

  return null; // Purely procedural audio, no UI.
}
