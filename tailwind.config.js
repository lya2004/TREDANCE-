/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FBFBFD',
        canvas: '#F5F5F7',
        surface: {
          DEFAULT: '#0f0f13',
          1: '#14141a',
          2: '#1a1a22',
          3: '#1f1f2a',
          border: 'rgba(255,255,255,0.07)',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.045)',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.07)',
        },
        accent: {
          blue: '#007AFF',
          indigo: '#5856D6',
          purple: '#AF52DE',
          green: '#34C759',
          amber: '#FF9F0A',
          red: '#FF3B30',
          teal: '#5AC8FA',
        },
        neutral: {
          950: '#0A0A0B',
          900: '#1D1D1F',
          800: '#2C2C2E',
          700: '#3A3A3C',
          600: '#48484A',
          500: '#636366',
          400: '#8E8E93',
          300: '#AEAEB2',
          200: '#D1D1D6',
          100: '#E5E5EA',
          50: '#F2F2F7',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.06)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.08)',
        'glass-sm': '0 2px 12px rgba(0, 0, 0, 0.04)',
        node: '0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        'node-selected': '0 4px 16px rgba(0, 122, 255, 0.15), 0 0 0 2px rgba(0, 122, 255, 0.3)',
        'node-error': '0 4px 16px rgba(255, 59, 48, 0.15), 0 0 0 2px rgba(255, 59, 48, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'timeline-enter': 'timelineEnter 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-24px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        timelineEnter: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
