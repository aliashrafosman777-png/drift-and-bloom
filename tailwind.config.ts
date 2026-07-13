import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}', './src/context/**/*.{ts,tsx}', './src/layouts/**/*.{ts,tsx}', './src/views/**/*.{ts,tsx}', './src/routes/**/*.{ts,tsx}', './src/utils/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#7A9E7E',
          50: '#F1F6F1',
          100: '#E2EBE2',
          200: '#C5D8C7',
          300: '#A8C4AB',
          400: '#8FB293',
          500: '#7A9E7E',
          600: '#5F8364',
          700: '#4A6A4E',
        },
        beige: {
          DEFAULT: '#F5F1E8',
          light: '#FBF9F4',
          dark: '#ECE5D4',
        },
        olive: {
          DEFAULT: '#46523B',
          light: '#5A6849',
          dark: '#2F3727',
        },
        brown: {
          DEFAULT: '#B68D65',
          light: '#D2B393',
          dark: '#94714E',
        },
        gold: {
          DEFAULT: '#C9A961',
          light: '#E0C384',
          dark: '#A9854A',
        },
        charcoal: '#2F2F2F',
        cream: '#FAF7F0',
        ivory: '#F8F5EF',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        display: ['var(--font-cormorant)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(47, 47, 47, 0.06)',
        card: '0 2px 16px rgba(47, 47, 47, 0.08)',
        lift: '0 12px 32px rgba(70, 82, 59, 0.14)',
      },
      letterSpacing: {
        widest2: '0.2em',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
    },
  },
  plugins: [],
}

export default config
