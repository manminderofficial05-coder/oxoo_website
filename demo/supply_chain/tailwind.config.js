/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#183F35',
          sidebar: '#153B32',
          active: '#2F7259',
          bg: '#F5F3EC',
          card: '#FCFBF7',
          sage: '#CBD2B4',
          amber: '#EED89A',
          coral: '#D3ADA4',
          text: '#202D29',
          muted: '#7D8179',
          border: '#E4E0D7',
          success: '#2D9660',
          warning: '#D49A30',
          error: '#C85D52',
          info: '#4875CF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
