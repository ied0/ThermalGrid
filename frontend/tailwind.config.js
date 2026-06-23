// Tailwind ayarlari. content -> Tailwind'in hangi dosyalardaki class'lari
// tarayip CSS uretecegini soyluyoruz. src altindaki tum jsx dosyalari.
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},   // simdilik ekstra tema ayarina gerek yok, varsayilan renkler yeter
  },
  plugins: [],
};
