import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        gold: 'var(--gold)',
        sage: 'var(--sage)',
        'slate-blue': 'var(--slate-blue)',
        'lef-red': 'var(--red)',
        red: 'var(--red)',
        success: 'var(--success)',
      },
      fontFamily: {
        // Montserrat — geometric display / headings
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        // Lexend — reading-optimised body / UI text
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Only text-xs is bumped (12px → 13px) to fix illegible labels/captions.
        // All other steps stay at Tailwind defaults — the larger sizes were fine.
        xs: ['0.8125rem', { lineHeight: '1.5' }], // 13px  (was 12px)
        sm: ['0.875rem', { lineHeight: '1.6' }], // 14px  (Tailwind default)
        base: ['1rem', { lineHeight: '1.7' }], // 16px  (Tailwind default)
        lg: ['1.125rem', { lineHeight: '1.6' }], // 18px  (Tailwind default)
        xl: ['1.25rem', { lineHeight: '1.5' }], // 20px  (Tailwind default)
        '2xl': ['1.5rem', { lineHeight: '1.4' }], // 24px  (Tailwind default)
        '3xl': ['1.875rem', { lineHeight: '1.3' }], // 30px  (Tailwind default)
        '4xl': ['2.25rem', { lineHeight: '1.2' }], // 36px  (Tailwind default)
        '5xl': ['3rem', { lineHeight: '1.1' }], // 48px  (Tailwind default)
        '6xl': ['3.75rem', { lineHeight: '1.05' }], // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }], // 72px
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
      maxWidth: {
        content: '1100px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
