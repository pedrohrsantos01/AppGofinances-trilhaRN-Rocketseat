/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["./src/__tests__/setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "setup\\.ts$"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|victory-native|styled-components|react-native-gesture-handler|react-native-responsive-fontsize|react-native-uuid|@react-native-async-storage/async-storage)",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.styles.{ts,tsx}",
    "!src/**/styles.{ts,tsx}",
    "!src/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    "./src/shared/domain/": {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
