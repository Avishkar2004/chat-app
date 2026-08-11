/** @type {import('tailwindcss').Config} */
const withVar = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        /* ---- Semantic tokens. Use these. ------------------------------- */
        canvas: withVar("canvas"),
        surface: {
          DEFAULT: withVar("surface"),
          2: withVar("surface-2"),
          3: withVar("surface-3"),
        },
        line: {
          DEFAULT: withVar("line"),
          strong: withVar("line-strong"),
        },
        fg: {
          DEFAULT: withVar("fg"),
          muted: withVar("fg-muted"),
          subtle: withVar("fg-subtle"),
          inverted: withVar("fg-inverted"),
        },
        accent: {
          DEFAULT: withVar("accent"),
          hover: withVar("accent-hover"),
          fg: withVar("accent-fg"),
          soft: withVar("accent-soft"),
          text: withVar("accent-text"),
        },
        positive: {
          DEFAULT: withVar("positive"),
          soft: withVar("positive-soft"),
          text: withVar("positive-text"),
        },
        danger: {
          DEFAULT: withVar("danger"),
          soft: withVar("danger-soft"),
          text: withVar("danger-text"),
        },
        warning: {
          DEFAULT: withVar("warning"),
          soft: withVar("warning-soft"),
          text: withVar("warning-text"),
        },
        bubble: {
          in: withVar("bubble-in"),
          "in-fg": withVar("bubble-in-fg"),
          out: withVar("bubble-out"),
          "out-fg": withVar("bubble-out-fg"),
        },
        focus: withVar("focus"),
      },

      /* Rule 7: message text never below 15px, metadata never below 12px
         and never the same weight as the message. */
      fontSize: {
        meta: ["0.75rem", { lineHeight: "1rem" }],
        label: ["0.8125rem", { lineHeight: "1.125rem" }],
        msg: ["0.9375rem", { lineHeight: "1.5" }],
      },

      /* Rule 7: cap the message column near 65 characters. */
      maxWidth: {
        msg: "65ch",
      },
    },
  },
  plugins: [],
};
