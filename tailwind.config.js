export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        'gold-light': '#E8C84A',
        'gold-deep': '#B8962E',
        'deep-black': '#0A0A0A',
        'dark-surface': '#141414',
        'soft-surface': '#1E1E1E',
        'muted-surface': '#2A2A2A',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 18px 60px rgba(212, 175, 55, 0.16)',
      },
    },
  },
  plugins: [],
};
