// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // 1. 기본 프리셋으로 ts-jest를 사용
  preset: 'ts-jest',

  // 2. 테스트 환경 설정
  testEnvironment: 'jsdom',

  // 3. 테스트 파일 패턴
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ],

  // 4. TypeScript/TSX 파일을 ts-jest를 사용하여 변환하도록 명시적으로 지정
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        // ts-jest가 사용할 tsconfig 파일을 명확하게 지정
        tsconfig: 'tsconfig.test.json'
      }
    ]
  },

  // 5. 경로 별칭(@/...)을 Jest가 이해할 수 있도록 설정
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // CSS 모듈 모킹
    '\\.module\\.(css|scss|sass)$': 'identity-obj-proxy',
    // 일반 CSS 파일 모킹
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    // 이미지 파일 모킹
    '\\.(png|jpg|jpeg|gif|svg)$': 'jest-transform-stub'
  },

  // 6. 설정 파일들
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // 7. 커버리지 설정
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/main/**', // Electron main process 제외
  ],

  // 8. 테스트 타임아웃
  testTimeout: 10000,

  // 9. 모듈 파일 확장자
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // 10. node_modules에서 변환이 필요한 모듈들
  transformIgnorePatterns: [
    'node_modules/(?!(some-esm-package)/)'
  ],

  // 11. 글로벌 설정
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  }
};