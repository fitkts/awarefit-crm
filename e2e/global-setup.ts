import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 E2E 테스트 환경 설정 시작...');

  // 브라우저 실행하여 애플리케이션 접근 가능한지 확인
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📡 애플리케이션 서버 연결 확인...');
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3002', {
      timeout: 30000,
    });

    // 기본 페이지가 로드되는지 확인
    await page.waitForSelector('h1, h2', { timeout: 10000 });
    console.log('✅ 애플리케이션 서버 연결 성공');

    // 환경 정보 수집
    const environmentInfo = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        hasElectronAPI: typeof (window as any).electronAPI !== 'undefined',
        appVersion: document.querySelector('[class*="version"]')?.textContent || 'v1.0.0',
        currentTime: new Date().toISOString(),
      };
    });

    console.log('🔍 테스트 환경 정보:', environmentInfo);

    // 테스트 결과 디렉토리 생성
    const fs = require('fs');
    const path = require('path');

    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // 환경 정보를 파일로 저장
    const envFilePath = path.join(resultsDir, 'environment.json');
    fs.writeFileSync(envFilePath, JSON.stringify(environmentInfo, null, 2));
  } catch (error) {
    console.error('❌ 애플리케이션 서버 연결 실패:', error);
    throw error;
  } finally {
    await page.close();
    await browser.close();
  }

  console.log('✅ E2E 테스트 환경 설정 완료');
}

export default globalSetup;
