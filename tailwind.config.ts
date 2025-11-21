import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        teal: '#00D4AA'
      }
    }
  },
  plugins: []
}

export default config
