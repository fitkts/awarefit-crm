// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // 1. 기본 프리셋으로 ts-jest를 사용
  preset: 'ts-jest',

  // 2. 테스트 환경은 node
  testEnvironment: 'node',

  // 3. TypeScript/TSX 파일을 ts-jest를 사용하여 변환하도록 명시적으로 지정
  // 이것이 가장 중요한 부분입니다.
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        // 4. ts-jest가 사용할 tsconfig 파일을 명확하게 지정
        tsconfig: 'tsconfig.test.json'
      }
    ]
  },

  // 5. 경로 별칭(@/...)을 Jest가 이해할 수 있도록 설정
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};