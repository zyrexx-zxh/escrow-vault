import type { Config } from 'tailwindcss';

/**
 * Tailwind is kept for its base reset and so you can use utility classes in new components.
 * The site itself is styled in app/globals.css.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#05070a',
        surface: '#0d1117',
        accent: '#35f2b2',
        cyan: '#5cc8ff',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
