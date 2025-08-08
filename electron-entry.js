// 🚀 Electron 엔트리 포인트 최적화
const { app } = require('electron');
const path = require('path');

// 🚀 최적화된 시작 설정
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// 🚀 메모리 사용량 최적화
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('--disable-dev-shm-usage');
}

// 🚀 GPU 가속 비활성화로 시작 시간 단축 (macOS)
if (process.platform === 'darwin') {
  app.commandLine.appendSwitch('--disable-gpu');
  app.commandLine.appendSwitch('--disable-software-rasterizer');
}

// 🚀 빠른 시작을 위한 추가 최적화 플래그
app.commandLine.appendSwitch('--disable-background-timer-throttling');
app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('--disable-renderer-backgrounding');
app.commandLine.appendSwitch('--disable-extensions');
app.commandLine.appendSwitch('--disable-plugins');
app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');

// 🚀 메인 프로세스 로드
require('./dist/main/main.js');