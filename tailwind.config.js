/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Satoshi', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Satoshi', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          900: '#0a0e1a',
          800: '#111827',
          700: '#1a1f35',
          600: '#232942',
          500: '#2d3555',
        },
        accent: {
          indigo: '#6366f1',
          'indigo-light': '#818cf8',
          emerald: '#34d399',
          'emerald-light': '#6ee7b7',
          amber: '#fbbf24',
          rose: '#fb7185',
          cyan: '#22d3ee',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-scale': 'fadeInScale 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient': 'gradientShift 4s ease infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
