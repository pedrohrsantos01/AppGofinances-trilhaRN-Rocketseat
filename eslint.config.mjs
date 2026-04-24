import expoConfig from "eslint-config-expo/flat.js";
import prettierConfig from "eslint-config-prettier";

export default [
  ...expoConfig,
  prettierConfig,
  {
    ignores: [
      "node_modules/",
      "dist/",
      "android/",
      "ios/",
      ".expo/",
      "coverage/",
      "e2e/",
      "babel.config.js",
      "metro.config.js",
      "jest.config.js",
      ".detoxrc.js",
    ],
  },
  {
    files: ["**/*Styles.{ts,tsx}", "**/styles.{ts,tsx}"],
    rules: {
      "import/no-named-as-default": "off",
    },
  },
  {
    files: ["src/__tests__/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["src/features/*/presentation/**/*.{ts,tsx}", "src/shared/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/domain/*"],
              allowTypeImports: true,
              message:
                "Presentation layer should not import domain directly. Use application layer or hooks.",
            },
          ],
        },
      ],
    },
  },
];
