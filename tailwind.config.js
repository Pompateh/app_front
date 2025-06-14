module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          crimson: ['"Crimson Pro"', 'serif'],
        },
      },
    },
    plugins: [require('@tailwindcss/line-clamp'),],
  }