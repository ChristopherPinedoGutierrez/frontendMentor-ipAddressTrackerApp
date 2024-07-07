/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{mjs,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        mobile: 'url("./../projectInfo/images/pattern-bg-mobile.png")',
        desktop: 'url("./../projectInfo/images/pattern-bg-desktop.png")'
      }
    }
  },
  plugins: []
}
