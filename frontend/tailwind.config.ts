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
        // Deep Charcoal theme
        charcoal: {
          950: '#0F172A', // Deepest dark
          900: '#1E293B', // Deep dark
          800: '#334155', // Dark
          700: '#475569', // Medium dark
          600: '#64748B', // Medium
        },
        // Electric Blue accents
        electric: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C3D66',
        },
      },
      backgroundColor: {
        dark: '#0F172A',
        darker: '#1E293B',
      },
      borderColor: {
        dark: '#334155',
      },
      textColor: {
        electric: '#0EA5E9',
      },
      boxShadow: {
        glow: '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-lg': '0 0 40px rgba(6, 182, 212, 0.4)',
      },
      backgroundImage: {
        'gradient-electric': 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #3b82f6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
