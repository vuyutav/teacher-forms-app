// tailwind.config.ts
// This extends Tailwind's default colors with our Furina palette.
// Every custom color here becomes a Tailwind class you can use
// anywhere — e.g. bg-ocean, text-gold, border-sky

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Furina palette — use these as bg-ocean, text-gold, etc.
        ocean:  '#1A6BAD',   // deep ocean blue — primary brand color
        sky:    '#4FB3EF',   // sky blue — hover states, accents
        pearl:  '#F0F8FF',   // pearl white — page backgrounds
        gold:   '#C9A84C',   // gold — borders, decorative elements
        navy:   '#0a3d6b',   // deep navy — dark text on light bg
        ice:    '#d4ecff',   // ice blue — card backgrounds
      },
      fontFamily: {
        // These names match what we set up in layout.tsx
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)',    'system-ui', 'sans-serif'],
      },
      animation: {
        // Custom animations we'll use throughout the app
        'float':      'float 3s ease-in-out infinite',
        'ripple':     'ripple 0.6s linear',
        'fade-up':    'fadeUp 0.5s ease-out',
        'water-wave': 'waterWave 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
          // Creates a gentle floating up-and-down motion
        },
        ripple: {
          '0%':   { transform: 'scale(0)',    opacity: '1' },
          '100%': { transform: 'scale(4)',    opacity: '0' },
          // Expands from center and fades — water drop effect
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
          // Slides up from below while fading in
        },
        waterWave: {
          '0%, 100%': { transform: 'scaleX(1)   scaleY(1)' },
          '50%':      { transform: 'scaleX(1.05) scaleY(0.95)' },
          // Subtle breathing/wave motion for background elements
        },
      },
    },
  },
  plugins: [],
}

export default config