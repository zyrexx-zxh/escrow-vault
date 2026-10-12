import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#030406',
          emerald: '#10f2a5',
          blue: '#3b8bff',
        },
      },
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Inter"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      keyframes: {
        pulseDot: {
          '0%': { boxShadow: '0 0 0 0 rgba(16,242,165,0.55)' },
          '70%': { boxShadow: '0 0 0 10px rgba(16,242,165,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16,242,165,0)' },
        },
        scrollHint: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(250%)' },
        },
        nudge: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 2.2s ease-out infinite',
        'scroll-hint': 'scrollHint 2s cubic-bezier(0.65, 0, 0.35, 1) infinite',
        nudge: 'nudge 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
