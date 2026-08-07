/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"],
};
