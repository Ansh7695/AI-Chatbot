/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pool: {
          deep: '#0E1B2A',
          mid: '#1B3040',
        },
        clay: {
          sand: '#F2E9DC',
          coral: '#E8917C',
        },
        glass: {
          foam: 'rgba(255, 255, 255, 0.08)',
        },
        glow: {
          bio: '#6FE7DD',
        }
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
