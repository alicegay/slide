import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        slide: {
          ...require('daisyui/src/theming/themes')['dracula'],
          primary: '#7f3737',
          secondary: '#e67e22',
        },
      },
      'dracula',
    ],
  },
}
export default config
