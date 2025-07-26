module.exports = {
  // TypeScript/JavaScript 파일
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'git add',
  ],

  // JSON 파일
  '*.json': [
    'prettier --write',
    'git add',
  ],

  // CSS 파일
  '*.{css,scss}': [
    'prettier --write',
    'git add',
  ],

  // 마크다운 파일
  '*.md': [
    'prettier --write',
    'git add',
  ],

  // 패키지 파일은 타입 체크까지
  'package.json': [
    'prettier --write',
    'npm run type-check',
    'git add',
  ],
}; 