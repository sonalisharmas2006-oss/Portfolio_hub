import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#E8D5BD',
        'bg-light': '#F3E5D3',
        'bg-warm': '#D7BFA5',
        'espresso': '#382316',
        'coffee': '#563A29',
        'rose-muted': '#C99186',
        'sage': '#87927A',
        'dusty-blue': '#8999A8',
        'cream': '#FAF1E6',
        'gold': '#C4954A',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        handwritten: ['Caveat', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
