/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Primary: Deep Forest Green #1B4332
        forest: {
          50:  '#edf5f0',
          100: '#d0e6d9',
          200: '#a0ccb3',
          300: '#6db38d',
          400: '#3f9a67',
          500: '#1B4332',
          600: '#163826',
          700: '#112d1d',
          800: '#0c2115',
          900: '#07160d',
        },
        // Accent: Earth Orange #D97706
        earth: {
          50:  '#fdf8ed',
          100: '#faefd0',
          200: '#f5dea1',
          300: '#efcc71',
          400: '#eab842',
          500: '#D97706',
          600: '#b36205',
          700: '#8d4d04',
          800: '#663803',
          900: '#402302',
        },
        // Background: Sage Mist #F0F4F1
        sage: {
          50:  '#F0F4F1',
          100: '#e1e9e3',
          200: '#c3d3c7',
          300: '#a5bdab',
          400: '#87a78f',
          500: '#6a9173',
          600: '#547a5c',
          700: '#416048',
          800: '#2e4533',
          900: '#1b2b1f',
        },
        // Legacy farm colors (kept for compatibility)
        farm: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1B4332 0%, #2d6a4f 50%, #1B4332 100%)',
        'card-gradient': 'linear-gradient(135deg, #edf5f0 0%, #F0F4F1 100%)',
      },
      boxShadow: {
        'soft':    '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)',
        'forest':  '0 4px 20px -4px rgba(27,67,50,0.3)',
        'earth':   '0 4px 20px -4px rgba(217,119,6,0.3)',
        'drawer':  '-4px 0 30px rgba(0,0,0,0.12)',
        'bottom':  '0 -2px 20px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'slide-right':  'slideRight 0.35s cubic-bezier(0.32,0.72,0,1)',
        'slide-left':   'slideLeft 0.35s cubic-bezier(0.32,0.72,0,1)',
        'bounce-soft':  'bounceSoft 0.4s ease-out',
        'pulse-dot':    'pulseDot 1.8s ease-out infinite',
        'shimmer':      'shimmer 4s linear infinite',
        'float':        'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:    { from: { transform: 'translateY(10px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideRight: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        slideLeft:  { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        bounceSoft: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)' } },
        pulseDot:   { '0%': { transform: 'scale(0.9)', opacity: '0.7' }, '100%': { transform: 'scale(1.8)', opacity: '0' } },
        shimmer:    { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        float:      {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-14px) rotate(4deg)' },
          '66%':      { transform: 'translateY(-7px) rotate(-3deg)' },
        },
      },
    },
  },
  plugins: [],
}
