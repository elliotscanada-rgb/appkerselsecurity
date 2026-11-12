/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kestrel-black': '#000000',
        'kestrel-charcoal': '#2B2B2B',
        'kestrel-gold': '#D4AF37',
        'kestrel-gold-light': '#F4E5B8',
        'kestrel-gold-dark': '#B8941F',
        'kestrel-white': '#FFFFFF',
        'kestrel-grey': '#F5F5F5',
        'kestrel-grey-dark': '#CCCCCC',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
