/** @type {import('prettier').Config} */
module.exports = {
  semi: true,
  trailingComma: "es5",
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",
  arrowParens: "always",
  bracketSpacing: true,
  htmlWhitespaceSensitivity: "css",
  vueIndentScriptAndStyle: false,
  embeddedLanguageFormatting: "auto",
  quoteProps: "as-needed",
  jsxSingleQuote: true,
  proseWrap: "preserve",
  requirePragma: false,
  insertPragma: false,
  overrides: [
    {
      files: "*.json",
      options: {
        singleQuote: false,
        trailingComma: "none",
      },
    },
    {
      files: "*.md",
      options: {
        printWidth: 100,
        proseWrap: "always",
      },
    },
  ],
};
