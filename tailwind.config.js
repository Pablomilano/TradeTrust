/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#E8631C',
        },
        bg: '#14171B',
        text: '#1d1d1f',
        muted: '#6e6e73',
        border: '#d2d2d7',
      },
      fontFamily: {
        sans: ['var(--font-body)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 6px 18px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        full: '9999px',
      },
    },
  },
  container: {
    center: true,
    padding: '1rem',
    screens: {
      xl: '1200px',
    },
  },
  plugins: [],
};