const { app, BrowserWindow } = require('electron');
const path = require('path');

// 개발 환경 설정
process.env.NODE_ENV = 'development';

// 메인 프로세스 TypeScript 파일을 컴파일하고 실행
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    target: 'es2020',
    module: 'commonjs'
  }
});

// 메인 프로세스 실행
require('./src/main/main.ts'); 