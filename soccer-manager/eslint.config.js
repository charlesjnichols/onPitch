import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-restricted-syntax": [
        "warn",
        {
          selector: 'CallExpression[callee.name="setState"]',
          message:
            "Avoid calling setState directly; use state setters from hooks and avoid calling them in render.",
        },
        {
          selector:
            "CallExpression[callee.name=/^set[A-Z].*/]:not(:has(ThisExpression))",
          message:
            "Avoid calling setState-like setters inside render/useMemo/useCallback bodies; move to useEffect with guards.",
        },
      ],
    },
  },
]);
