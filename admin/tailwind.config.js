/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#edf5f0', 500:'#1B4332', 600:'#163826', 700:'#112d1d' },
        accent:{ 500:'#D97706', 600:'#b36205' },
      }
    }
  },
  plugins: [],
}
