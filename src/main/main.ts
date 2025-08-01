import { app, BrowserWindow, dialog, Menu } from 'electron';
import * as path from 'path';
import { initializeDatabase } from '../database/init';
import { registerMemberHandlers } from './ipc/memberHandlers';
import { registerPaymentHandlers } from './ipc/paymentHandlers';
import { registerStaffHandlers } from './ipc/staffHandlers';
import { registerSystemHandlers } from './ipc/systemHandlers';

// 개발 환경 여부 확인
const isDev = process.env.NODE_ENV === 'development';

// macOS GPU 경고 및 기타 경고 완전 억제
if (process.platform === 'darwin') {
  app.commandLine.appendSwitch('--disable-gpu');
  app.commandLine.appendSwitch('--disable-gpu-sandbox');
  app.commandLine.appendSwitch('--disable-gpu-memory-buffer-video-frames');
  app.commandLine.appendSwitch('--disable-software-rasterizer');
  app.commandLine.appendSwitch('--disable-background-timer-throttling');
  app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
  app.commandLine.appendSwitch('--disable-renderer-backgrounding');
  app.commandLine.appendSwitch('--disable-dev-shm-usage');
  app.commandLine.appendSwitch('--disable-extensions');
  app.commandLine.appendSwitch('--disable-features=VizDisplayCompositor');
  app.commandLine.appendSwitch('--no-sandbox');
}

// 메인 윈도우 인스턴스
let mainWindow: BrowserWindow | null = null;

// 앱 준비 완료 시 윈도우 생성
app.whenReady().then(() => {
  // 데이터베이스 초기화 (실패해도 앱 계속 실행)
  try {
    initializeDatabase();
    console.log('✅ 데이터베이스 초기화 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    console.log('⚠️ 데이터베이스 없이 앱을 실행합니다. 일부 기능이 제한될 수 있습니다.');
  }
  
  // IPC 핸들러는 항상 등록 (데이터베이스 실패와 무관하게)
  try {
    // 시스템 핸들러부터 등록 (데이터베이스 의존성이 적음)
    registerSystemHandlers();
    
    // 데이터베이스 의존적 핸들러들은 안전하게 등록
    registerMemberHandlers();
    registerStaffHandlers();
    registerPaymentHandlers();
    
    console.log('✅ IPC 핸들러 등록 완료');
  } catch (error) {
    console.error('❌ IPC 핸들러 등록 실패:', error);
    console.log('⚠️ 백엔드 기능이 제한될 수 있습니다.');
  }

  createMainWindow();
  createMenu();

  // macOS에서 dock 아이콘 클릭 시 윈도우 재생성
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// 모든 윈도우가 닫혔을 때
app.on('window-all-closed', () => {
  // macOS가 아닌 경우 앱 종료
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 메인 윈도우 생성 함수
function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false, // 준비될 때까지 숨김
    center: true, // 화면 중앙에 배치
    resizable: true, // 크기 조절 가능
    maximizable: true, // 최대화 가능
    minimizable: true, // 최소화 가능
    closable: true, // 닫기 가능
    icon: path.join(__dirname, '../../public/icons/icon.png'), // 아이콘 설정
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: isDev
        ? path.join(__dirname, '../../dist/main/preload.js')
        : path.join(__dirname, 'preload.js'), // preload 스크립트
      webSecurity: true, // 항상 보안 활성화 (경고 제거)
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      backgroundThrottling: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: process.platform === 'darwin' ? { x: 20, y: 20 } : undefined,
    titleBarOverlay:
      process.platform !== 'darwin'
        ? {
            color: '#ffffff',
            symbolColor: '#000000',
          }
        : undefined,
  });

  // 개발 환경과 프로덕션 환경에 따른 로드
  if (isDev) {
    mainWindow.loadURL('http://localhost:3002');
    mainWindow.webContents.openDevTools(); // 개발 도구 열기
  } else {
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  }

  // 윈도우 준비 완료 시 표시
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();

      // 화면 중앙에 배치 (자석 효과 방지)
      mainWindow.center();

      // 개발 환경에서 최대화하지 않고 적절한 크기로 시작
      if (isDev) {
        // 화면 크기의 80% 정도로 설정
        const { screen } = require('electron');
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width, height } = primaryDisplay.workAreaSize;

        const windowWidth = Math.min(1400, Math.floor(width * 0.8));
        const windowHeight = Math.min(900, Math.floor(height * 0.8));

        mainWindow.setSize(windowWidth, windowHeight);
        mainWindow.center();
      }
    }
  });

  // 윈도우 닫힘 이벤트
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 윈도우 크기 변경 이벤트 처리 (반응형 지원)
  mainWindow.on('resize', () => {
    if (mainWindow) {
      // 윈도우 크기 변경 시 필요한 추가 로직
      const [width, height] = mainWindow.getSize();
      console.log(`Window resized to: ${width}x${height}`);
    }
  });

  // 외부 링크는 기본 브라우저에서 열기
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 애플리케이션 메뉴 생성
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Awarefit CRM',
      submenu: [
        {
          label: '앱 정보',
          role: 'about',
        },
        { type: 'separator' },
        {
          label: '환경설정',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // 환경설정 윈도우 열기 (추후 구현)
            if (mainWindow) {
              mainWindow.webContents.send('open-settings');
            }
          },
        },
        { type: 'separator' },
        {
          label: '종료',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '편집',
      submenu: [
        { label: '실행 취소', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '다시 실행', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '잘라내기', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '복사', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '붙여넣기', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '모두 선택', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },
    {
      label: '보기',
      submenu: [
        { label: '새로 고침', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '강제 새로 고침', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '개발자 도구', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '실제 크기', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '확대', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '축소', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '전체화면', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
    {
      label: '데이터',
      submenu: [
        {
          label: '데이터베이스 백업',
          accelerator: 'CmdOrCtrl+B',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow!, {
              title: '데이터베이스 백업',
              defaultPath: `awarefit-backup-${new Date().toISOString().split('T')[0]}.db`,
              filters: [
                { name: 'Database files', extensions: ['db'] },
                { name: 'All files', extensions: ['*'] },
              ],
            });

            if (!result.canceled && result.filePath) {
              if (mainWindow) {
                mainWindow.webContents.send('backup-database', result.filePath);
              }
            }
          },
        },
        {
          label: '데이터베이스 복원',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              title: '데이터베이스 복원',
              filters: [
                { name: 'Database files', extensions: ['db'] },
                { name: 'All files', extensions: ['*'] },
              ],
              properties: ['openFile'],
            });

            if (!result.canceled && result.filePaths[0]) {
              if (mainWindow) {
                mainWindow.webContents.send('restore-database', result.filePaths[0]);
              }
            }
          },
        },
      ],
    },
    {
      label: '윈도우',
      submenu: [
        { label: '최소화', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: '닫기', accelerator: 'CmdOrCtrl+W', role: 'close' },
      ],
    },
    {
      label: '도움말',
      submenu: [
        {
          label: '사용 가이드',
          click: () => {
            require('electron').shell.openExternal(
              'https://github.com/your-repo/awarefit-crm/wiki'
            );
          },
        },
        {
          label: '문제 신고',
          click: () => {
            require('electron').shell.openExternal(
              'https://github.com/your-repo/awarefit-crm/issues'
            );
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC 핸들러들은 별도 파일에서 등록됨

// 앱 종료 전 정리 작업
app.on('before-quit', () => {
  // 데이터베이스 연결 정리 등 (추후 구현)
  console.log('애플리케이션 종료 중...');
});
