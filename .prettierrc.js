/** @type {import('prettier').Config} */
module.exports = {
  printWidth: 100,
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  bracketSpacing: true,
  useTabs: false,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['<THIRD_PARTY_MODULES>', '^[./]'],
  importOrderCaseInsensitive: false,
  importOrderSortSpecifiers: true,
}
