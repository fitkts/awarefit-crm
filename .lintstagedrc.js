module.exports = {
  // TypeScript/JavaScript 파일
  '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],

  // JSON, CSS, 마크다운 파일
  '*.{json,css,scss,md}': ['prettier --write'],
};
