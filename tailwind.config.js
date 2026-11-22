/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#14532D',
        emerald: '#047857',
        fresh: '#16A34A',
        mint: '#DCFCE7',
        offwhite: '#F8FAF7',
        charcoal: '#1F2937',
        amber: {
          DEFAULT: '#F59E0B',
          dark: '#B45309',
        },
        water: '#2563EB',
        severe: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 53, 29, 0.06), 0 1px 2px rgba(16, 53, 29, 0.04)',
        cardlg: '0 4px 16px rgba(16, 53, 29, 0.08), 0 2px 6px rgba(16, 53, 29, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
