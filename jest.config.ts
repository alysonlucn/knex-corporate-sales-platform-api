import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },
  clearMocks: true,
  collectCoverageFrom: [
    'src/modules/**/services/**/*.ts',
    '!src/modules/**/dtos/**',
    '!src/modules/**/infra/**',
  ],
};

export default config;
