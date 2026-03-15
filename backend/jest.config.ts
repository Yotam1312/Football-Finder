import type { Config } from 'jest';

// Jest configuration for the Football Finder backend
// ts-jest compiles TypeScript on-the-fly so we don't need a separate build step
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Look for test files in __tests__ directories or files ending in .test.ts
  testMatch: ['**/__tests__/**/*.test.ts'],
  // ts-jest transform configuration (modern syntax to avoid deprecation warnings)
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
};

export default config;
