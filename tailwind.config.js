/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 5s linear infinite",
        "spin-reverse": "spin-reverse 7s linear infinite",
        "ping-faster": "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "glitch-active": "glitch-active 1s linear infinite",
        "glitch-idle": "glitch-idle 4s linear infinite",
      },
      keyframes: {
        "spin-reverse": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(-360deg)" },
        },
        "glitch-active": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "20%, 60%": { transform: "translate(-2px, 2px)" },
          "40%, 80%": { transform: "translate(2px, -2px)" },
        },
        "glitch-idle": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(1px, -1px)" },
          "50%": { transform: "translate(-1px, 1px)" },
          "75%": { transform: "translate(1px, 1px)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
