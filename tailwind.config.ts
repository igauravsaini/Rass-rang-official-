import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a0412',
          deep: '#06020d',
          light: '#1a0a2e',
        },
        maroon: {
          DEFAULT: '#8B0A3A',
          deep: '#8B0A3A',
          light: '#B91452',
          velvet: '#6d0830',
        },
        gold: {
          DEFAULT: '#F0B429',
          light: '#FFD54F',
          pale: '#FFF3C4',
          rich: '#E09800',
          dark: '#8B6914',
        },
        saffron: '#FF6B00',
        vermillion: {
          DEFAULT: '#E53935',
          deep: '#C62828',
        },
        cream: '#FFF3C4',
        ivory: '#fdf6e3',
        'hot-pink': '#FF2D78',
        magenta: '#E91E9C',
        'electric-orange': '#FF8A00',
        'festive-purple': '#9C27B0',
        'festive-teal': '#00BFA5',
        'neon-green': '#76FF03',
        'dandiya-red': '#D50000',
        neutral: {
          100: '#f7f3eb',
          200: '#e8dfd3',
          300: '#d4c5b1',
          400: '#a09585',
          500: '#6b6055',
          600: '#4a4138',
        },
        text: {
          primary: '#fdf6e3',
          secondary: '#d4c5b1',
          muted: '#a09585',
        },
      },
      fontFamily: {
        display: ['Cinzel Decorative', 'Cinzel', 'serif'],
        heading: ['Cinzel', 'serif'],
        elegant: ['Cormorant Garamond', 'Marcellus', 'serif'],
        body: ['Outfit', 'sans-serif'],
        accent: ['Poppins', 'sans-serif'],
        hindi: ['Yatra One', 'cursive'],
      },
      boxShadow: {
        gold: '0 0 20px rgba(240,180,41,0.2)',
        'gold-strong': '0 0 30px rgba(240,180,41,0.4)',
        festive: '0 0 25px rgba(255,45,120,0.15), 0 0 50px rgba(233,30,156,0.08)',
        card: '0 8px 32px rgba(0,0,0,0.4)',
        elevated: '0 16px 48px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem',
      },
      keyframes: {
        loaderParticlesFloat: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.4' },
          '100%': { transform: 'translateY(-20px) scale(1.1)', opacity: '0.8' },
        },
        loaderContentSequence: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '20%': { opacity: '1', transform: 'scale(1)' },
          '85%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1.08)' },
        },
        rotateHalo: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        haloPulse: {
          '0%': { transform: 'scale(0.95)', opacity: '0.5' },
          '100%': { transform: 'scale(1.08)', opacity: '0.85' },
        },
        mottoReveal: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        heroParallax: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.05) translate(-1%, -1%)' },
          '100%': { transform: 'scale(1) translate(0, 0)' },
        },
        mandalaFloat: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.04)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        bellSwing: {
          '0%': { transform: 'rotate(-4deg)' },
          '100%': { transform: 'rotate(4deg)' },
        },
        bellGlowPulse: {
          '0%': { opacity: '0.3', transform: 'scale(0.9)' },
          '100%': { opacity: '0.7', transform: 'scale(1.15)' },
        },
        diyaFloat: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-12px)' },
        },
        flameFlicker: {
          '0%': { transform: 'scale(1) rotate(-1deg)', opacity: '0.9' },
          '100%': { transform: 'scale(1.1, 0.95) rotate(2deg)', opacity: '1' },
        },
        lightRaysPulse: {
          '0%': { transform: 'scale(0.9) rotate(0deg)', opacity: '0.4' },
          '50%': { transform: 'scale(1.1) rotate(180deg)', opacity: '0.7' },
          '100%': { transform: 'scale(0.9) rotate(360deg)', opacity: '0.4' },
        },
        logoGlow: {
          '0%': { filter: 'drop-shadow(0 0 15px rgba(240,180,41,0.3))' },
          '100%': { filter: 'drop-shadow(0 0 35px rgba(255,45,120,0.45))' },
        },
        titleShimmer: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2) drop-shadow(0 0 25px rgba(240,180,41,0.6))' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scrollDown: {
          '0%': { transform: 'translateY(0)', opacity: '0.8' },
          '50%': { transform: 'translateY(10px)', opacity: '0.3' },
          '100%': { transform: 'translateY(0)', opacity: '0.8' },
        },
      },
      animation: {
        'loader-particles': 'loaderParticlesFloat 8s ease-in-out infinite alternate',
        'loader-sequence': 'loaderContentSequence 3.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'rotate-halo': 'rotateHalo 16s linear infinite',
        'rotate-halo-slow': 'rotateHalo 30s linear infinite',
        'halo-pulse': 'haloPulse 3s ease-in-out infinite alternate',
        'motto-reveal': 'mottoReveal 1.2s 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 4s ease-in-out infinite',
        'hero-parallax': 'heroParallax 30s ease-in-out infinite alternate',
        'mandala-float': 'mandalaFloat 15s ease-in-out infinite',
        'bell-swing': 'bellSwing 4.5s ease-in-out infinite alternate',
        'bell-glow': 'bellGlowPulse 3s ease-in-out infinite alternate',
        'diya-float': 'diyaFloat 4s ease-in-out infinite alternate',
        'flame-flicker': 'flameFlicker 0.25s ease-in-out infinite alternate',
        'light-rays': 'lightRaysPulse 4s ease-in-out infinite alternate',
        'logo-glow': 'logoGlow 3s ease-in-out infinite alternate',
        'title-shimmer': 'titleShimmer 7s 2.5s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 1s forwards',
        'glow-rotate': 'glowRotate 3s linear infinite',
        'scroll-down': 'scrollDown 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
