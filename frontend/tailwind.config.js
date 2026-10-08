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
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc2fd',
          400: '#36a2fa',
          500: '#0c87eb',
          600: '#026bc9',
          700: '#0355a2',
          800: '#074885',
          900: '#0c3d6e',
          950: '#082749',
        },
        slateDark: {
          850: '#151f32',
          900: '#0f172a',
          950: '#090d16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
