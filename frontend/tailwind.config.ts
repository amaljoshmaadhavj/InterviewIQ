import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Soft pastel blue/cyan brand scale
        brand: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#BDE0FF',
          300: '#8CC8FF',
          400: '#5AA7FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        cyan: {
          soft: '#A5F3FC',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30, 41, 59, 0.04), 0 4px 12px rgba(30, 41, 59, 0.06)',
        card: '0 1px 2px rgba(30, 41, 59, 0.04), 0 8px 24px rgba(30, 41, 59, 0.08)',
        'card-lg': '0 2px 4px rgba(30, 41, 59, 0.05), 0 16px 40px rgba(37, 99, 235, 0.12)',
        float: '0 8px 24px rgba(37, 99, 235, 0.14)',
        glow: '0 0 24px rgba(56, 189, 248, 0.35)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3B82F6 0%, #38BDF8 55%, #22D3EE 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, #DBEAFE 0%, #CFFAFE 100%)',
        'gradient-hero':
          'radial-gradient(60% 55% at 15% 10%, rgba(191, 219, 254, 0.65) 0%, rgba(191, 219, 254, 0) 60%), radial-gradient(50% 50% at 85% 5%, rgba(165, 243, 252, 0.55) 0%, rgba(165, 243, 252, 0) 55%), radial-gradient(55% 60% at 80% 90%, rgba(224, 242, 254, 0.5) 0%, rgba(224, 242, 254, 0) 60%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'blob-drift': 'blob-drift 18s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-18px) translateX(8px)' },
        },
        'blob-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(24px, -20px) scale(1.06)' },
          '66%': { transform: 'translate(-16px, 14px) scale(0.97)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;