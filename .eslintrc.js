module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  env: {
    // RN/Hermes + web: timers, URL, fetch/FormData, localStorage (en web).
    browser: true,
    es2022: true,
  },
  rules: {
    "prettier/prettier": "error",
  },
};
