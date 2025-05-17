/** @type {import('prettier').Config} */

const config = {
  semi: true,
  tabWidth: 2,
  singleQuote: true,
  jsxSingleQuote: true,
  printWidth: 120,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindAttributes: ['class', 'className', '.*className'],
  tailwindFunctions: ['cva', 'cx'],
};

export default config;
