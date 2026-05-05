/** @type {import('tailwindcss').Config} */
const withVar = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        slate: {
          50: withVar("slate-50"),
          100: withVar("slate-100"),
          200: withVar("slate-200"),
          300: withVar("slate-300"),
          400: withVar("slate-400"),
          500: withVar("slate-500"),
          600: withVar("slate-600"),
          700: withVar("slate-700"),
          800: withVar("slate-800"),
          900: withVar("slate-900"),
          950: withVar("slate-950"),
        },
        indigo: {
          200: withVar("indigo-200"),
          300: withVar("indigo-300"),
          400: withVar("indigo-400"),
          500: withVar("indigo-500"),
          600: withVar("indigo-600"),
        },
        fuchsia: {
          500: withVar("fuchsia-500"),
          600: withVar("fuchsia-600"),
        },
        emerald: {
          400: withVar("emerald-400"),
          500: withVar("emerald-500"),
          600: withVar("emerald-600"),
        },
        rose: {
          100: withVar("rose-100"),
          500: withVar("rose-500"),
          950: withVar("rose-950"),
        },
      },
    },
  },
  plugins: [],
};
