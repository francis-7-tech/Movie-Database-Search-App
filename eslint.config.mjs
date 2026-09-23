// ESLint flat config 
// This lints app.js only. It is a check, not a build step.

import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["app.js"],
    languageOptions: {
      ecmaVersion: 2022,
      // app.js is loaded with <script src="app.js" defer>, not type="module",
      sourceType: "script",
      // Tells ESLint that document, fetch, console, setTimeout etc. exist.
      // Without this it reports every one of them as undefined.
      globals: globals.browser,
    },
  },
];
