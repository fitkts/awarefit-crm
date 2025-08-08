module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'unused-imports',
  ],
  extends: ['eslint:recommended', 'plugin:storybook/recommended'],
  rules: {
    // TypeScript 관련 규칙들
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // Import 관련 규칙들
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // React 관련 규칙들
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',

    // 일반적인 코드 품질 규칙들
    'no-console': 'off', // 콘솔 사용 허용
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off', // TypeScript ESLint로 대체
    'no-undef': 'off', // TypeScript에서 처리
    'no-case-declarations': 'off', // case 블록에서 변수 선언 허용
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    NodeJS: 'readonly',
    Electron: 'readonly',
    React: 'readonly',
    BufferEncoding: 'readonly',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'release/',
    '*.js',
    '*.config.js',
    'webpack.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'src/utils/memberTestUtils.ts', // 임시로 제외 (추후 수정 예정)
  ],
}; 