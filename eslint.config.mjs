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
    files: ["src/features/*/presentation/**/*.{ts,tsx}", "src/shared/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["**/domain/*", "**/application/*"],
              message:
                "Presentation layer should not import domain/application directly. Use hooks or props.",
            },
          ],
        },
      ],
    },
  },
];
