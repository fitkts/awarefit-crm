import { devices, type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  timeout: 60 * 1000, // 테스트 타임아웃 증가
  expect: {
    timeout: 10000, // expect 타임아웃 증가
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // 로컬에서도 재시도
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    actionTimeout: 15000, // 액션 타임아웃 증가
    baseURL: 'http://localhost:3002',
    trace: 'retain-on-failure', // 실패 시 트레이스 보존
    screenshot: 'only-on-failure', // 실패 시만 스크린샷
    video: 'retain-on-failure', // 실패 시 비디오 보존
    // 추가 컨텍스트 옵션
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    // 개발 환경에서 console 메시지 수집
    launchOptions: {
      slowMo: process.env.CI ? 0 : 100, // 로컬에서는 천천히 실행
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome에서 추가 플래그
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-gpu',
          ],
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    // 모바일 테스트
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
    // 태블릿 테스트
    {
      name: 'Tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev:webpack',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  // 글로벌 설정
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),
};

export default config;
