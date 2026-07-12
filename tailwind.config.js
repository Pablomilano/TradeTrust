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
          500: '#0071e3',
        },
        bg: '#fafafa',
        text: '#1d1d1f',
        muted: '#6e6e73',
        border: '#d2d2d7',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
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
