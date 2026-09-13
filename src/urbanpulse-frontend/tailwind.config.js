/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1f14',
          900: '#0d2818',
          800: '#123521',
        },
        pulse: {
          green: '#1f9d55',
          light: '#3fb96a',
          mint: '#e8f5ec',
          teal: '#2c8f7f',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        nav: '0 8px 30px -8px rgba(10, 31, 20, 0.35)',
        card: '0 4px 24px -6px rgba(10, 31, 20, 0.12)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
