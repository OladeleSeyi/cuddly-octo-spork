// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.svg$": "<rootDir>/__tests__/mocks/svg.js",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/__tests__/setup-test-env.js",
    "<rootDir>/__tests__/mocks/",
  ],
  transformIgnorePatterns: [
    "/node_modules/(?!lucide-react|@lucide|react-day-picker|date-fns|@radix-ui|@hookform|@tanstack|sonner)",
  ],
};

module.exports = createJestConfig(customJestConfig);
