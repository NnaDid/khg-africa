/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
       "./app/**/*.{js,jsx,ts,tsx}",
       "./components/**/*.{js,jsx,ts,tsx}",
       "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1BBC9B",
        secondary: "#0d2c54",
        background: "#0a1128",
      },
    },
  },
  plugins: [],
}
