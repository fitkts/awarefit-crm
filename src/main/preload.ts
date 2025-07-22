import { contextBridge, ipcRenderer } from 'electron';
import { EventEmitter } from 'events';

// 렌더러 프로세스에서 사용할 수 있는 안전한 API 정의
const electronAPI = {
  // 이벤트 이미터 추가
  events: new EventEmitter(),

  // 앱 정보
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // 데이터베이스 API
  database: {
    query: (sql: string, params: any[] = []) => ipcRenderer.invoke('database-query', sql, params),

    // 회원 관련 API
    member: {
      getAll: (filter?: any) => ipcRenderer.invoke('member-get-all', filter),
      getById: (id: number) => ipcRenderer.invoke('member-get-by-id', id),
      create: (data: any) => ipcRenderer.invoke('member-create', data),
      update: (id: number, data: any) => ipcRenderer.invoke('member-update', id, data),
      delete: (id: number) => ipcRenderer.invoke('member-delete', id),
      search: (query: string) => ipcRenderer.invoke('member-search', query),
    },

    // 결제 관련 API
    payment: {
      getAll: (filter?: any) => ipcRenderer.invoke('payment-get-all', filter),
      getById: (id: number) => ipcRenderer.invoke('payment-get-by-id', id),
      create: (data: any) => ipcRenderer.invoke('payment-create', data),
      update: (id: number, data: any) => ipcRenderer.invoke('payment-update', id, data),
      delete: (id: number) => ipcRenderer.invoke('payment-delete', id),
      getByMember: (memberId: number) => ipcRenderer.invoke('payment-get-by-member', memberId),
    },

    // 직원 관련 API
    staff: {
      getAll: (filter?: any) => ipcRenderer.invoke('staff-get-all', filter),
      getById: (id: number) => ipcRenderer.invoke('staff-get-by-id', id),
      create: (data: any) => ipcRenderer.invoke('staff-create', data),
      update: (id: number, data: any) => ipcRenderer.invoke('staff-update', id, data),
      delete: (id: number) => ipcRenderer.invoke('staff-delete', id),
      search: (query: string) => ipcRenderer.invoke('staff-search', query),
      getStats: () => ipcRenderer.invoke('staff-get-stats'),
      salaryHistory: (staffId: number) => ipcRenderer.invoke('staff-salary-history', staffId),
      salaryAdjust: (data: any) => ipcRenderer.invoke('staff-salary-adjust', data),
    },

    // 직원 역할 관련 API
    staffRole: {
      getAll: () => ipcRenderer.invoke('staff-roles-get-all'),
      create: (data: any) => ipcRenderer.invoke('staff-role-create', data),
      update: (id: number, data: any) => ipcRenderer.invoke('staff-role-update', id, data),
    },

    // 회원권 타입 관련 API
    membershipType: {
      getAll: () => ipcRenderer.invoke('membership-type-get-all'),
      getById: (id: number) => ipcRenderer.invoke('membership-type-get-by-id', id),
      create: (data: any) => ipcRenderer.invoke('membership-type-create', data),
      update: (id: number, data: any) => ipcRenderer.invoke('membership-type-update', id, data),
      delete: (id: number) => ipcRenderer.invoke('membership-type-delete', id),
    },

    // PT 패키지 관련 API
    ptPackage: {
      getAll: () => ipcRenderer.invoke('pt-package-get-all'),
      getById: (id: number) => ipcRenderer.invoke('pt-package-get-by-id', id),
      create: (data: any) => ipcRenderer.invoke('pt-package-create', data),
      update: (id: number, data: any) => ipcRenderer.invoke('pt-package-update', id, data),
      delete: (id: number) => ipcRenderer.invoke('pt-package-delete', id),
    },

    // 통계 관련 API
    stats: {
      getDashboard: () => ipcRenderer.invoke('stats-get-dashboard'),
      getMemberStats: () => ipcRenderer.invoke('stats-get-member'),
      getPaymentStats: (period?: string) => ipcRenderer.invoke('stats-get-payment', period),
      getAttendanceStats: (period?: string) => ipcRenderer.invoke('stats-get-attendance', period),
    },

    // 백업/복원 API
    backup: (filePath: string) => ipcRenderer.invoke('database-backup', filePath),
    restore: (filePath: string) => ipcRenderer.invoke('database-restore', filePath),
  },

  // 파일 시스템 API
  files: {
    selectFile: (options?: any) => ipcRenderer.invoke('file-select', options),
    saveFile: (options?: any) => ipcRenderer.invoke('file-save', options),
    openPath: (path: string) => ipcRenderer.invoke('file-open-path', path),
  },

  // 프린트 API
  print: {
    printToPDF: (options?: any) => ipcRenderer.invoke('print-to-pdf', options),
    print: (options?: any) => ipcRenderer.invoke('print', options),
  },

  // 알림 API
  notification: {
    show: (title: string, body: string, options?: any) =>
      ipcRenderer.invoke('notification-show', title, body, options),
  },

  // 이벤트 리스너 API
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => {
    const validChannels = [
      'open-settings',
      'backup-database',
      'restore-database',
      'database-updated',
      'member-updated',
      'payment-updated',
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  off: (channel: string, callback: (event: any, ...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  // 일회성 이벤트 리스너
  once: (channel: string, callback: (event: any, ...args: any[]) => void) => {
    const validChannels = ['open-settings', 'backup-database', 'restore-database'];

    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, callback);
    }
  },
};

// 타입 정의 (TypeScript 지원)
export type ElectronAPI = typeof electronAPI;

// 렌더러 프로세스에서 window.electronAPI로 접근 가능하도록 설정
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 전역 타입 선언
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
