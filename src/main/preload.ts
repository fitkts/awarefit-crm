import { contextBridge, ipcRenderer } from 'electron';

// Type definitions for better TypeScript support
interface ElectronAPI {
  database: {
    member: {
      getAll: (filter?: any) => Promise<any[]>;
      getById: (id: number) => Promise<any>;
      getDetail: (id: number) => Promise<any>;
      create: (data: any) => Promise<any>;
      update: (id: number, data: any) => Promise<any>;
      delete: (id: number) => Promise<any>;
      search: (query: string) => Promise<any[]>;
      getStats: () => Promise<any>;
      bulkAction: (action: string, memberIds: number[]) => Promise<any>;
      bulkAssignStaff: (memberIds: number[], staffId: number | null) => Promise<any>;
      debugSchema: () => Promise<any>;
      fixSchema: () => Promise<any>;
    };
    staff: {
      getAll: (filter?: any) => Promise<any[]>;
      getById: (id: number) => Promise<any>;
      create: (data: any) => Promise<any>;
      update: (id: number, data: any) => Promise<any>;
      delete: (id: number) => Promise<any>;
      search: (query: string) => Promise<any[]>;
      getStats: () => Promise<any>;
      salaryHistory: (staffId: number) => Promise<any[]>;
      salaryAdjust: (data: any) => Promise<any>;
    };
    staffRole: {
      getAll: () => Promise<any[]>;
      create: (data: any) => Promise<any>;
      update: (id: number, data: any) => Promise<any>;
    };
    payment: {
      getAll: (filter?: any) => Promise<any[]>;
      getById: (id: number) => Promise<any>;
      create: (data: any) => Promise<any>;
      update: (id: number, data: any) => Promise<any>;
      cancel: (id: number, staffId: number, reason?: string) => Promise<any>;
      getStats: (dateRange?: any) => Promise<any>;
      getByMember: (memberId: number) => Promise<any[]>;
      getByStaff: (staffId: number) => Promise<any[]>;
      checkRefundEligibility: (paymentId: number) => Promise<any>;
    };
    refund: {
      create: (data: any) => Promise<any>;
      update: (refundId: number, data: any) => Promise<any>;
    };
    membershipType: {
      getAll: () => Promise<any[]>;
      create: (data: any) => Promise<any>;
    };
    ptPackage: {
      getAll: () => Promise<any[]>;
    };
    query: (sql: string, params?: any[]) => Promise<any>;
  };
  app: {
    getVersion: () => Promise<string>;
    getAppPath: () => Promise<string>;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  database: {
    member: {
      getAll: (filter?: any) => ipcRenderer.invoke('member-get-all', filter),
      getById: (id: number) => ipcRenderer.invoke('member-get-by-id', id),
      getDetail: (id: number) => ipcRenderer.invoke('member-get-detail', id),
      create: (data: any) => ipcRenderer.invoke('member-create', data),
      update: (id: number, data: any) => ipcRenderer.invoke('member-update', id, data),
      delete: (id: number) => ipcRenderer.invoke('member-delete', id),
      search: (query: string) => ipcRenderer.invoke('member-search', query),
      getStats: () => ipcRenderer.invoke('member-get-stats'),
      bulkAction: (action: string, memberIds: number[]) =>
        ipcRenderer.invoke('member-bulk-action', action, memberIds),
      bulkAssignStaff: (memberIds: number[], staffId: number | null) =>
        ipcRenderer.invoke('member-bulk-assign-staff', memberIds, staffId),
      debugSchema: () => ipcRenderer.invoke('member-debug-schema'),
      fixSchema: () => ipcRenderer.invoke('member-fix-schema'),
    },
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
    staffRole: {
      getAll: () => ipcRenderer.invoke('staff-roles-get-all'),
      create: (data: any) => ipcRenderer.invoke('staff-role-create', data),
      update: (id: number, data: any) => ipcRenderer.invoke('staff-role-update', id, data),
    },
    payment: {
      getAll: (filter?: any) => ipcRenderer.invoke('payment-get-all', filter),
      getById: (id: number) => ipcRenderer.invoke('payment-get-by-id', id),
      create: (data: any) => ipcRenderer.invoke('payment-create', data),
      update: (id: number, data: any) => ipcRenderer.invoke('payment-update', id, data),
      cancel: (id: number, staffId: number, reason?: string) =>
        ipcRenderer.invoke('payment-cancel', id, staffId, reason),
      getStats: (dateRange?: any) => ipcRenderer.invoke('payment-get-stats', dateRange),
      getByMember: (memberId: number) => ipcRenderer.invoke('payment-get-by-member', memberId),
      getByStaff: (staffId: number) => ipcRenderer.invoke('payment-get-by-staff', staffId),
      checkRefundEligibility: (paymentId: number) =>
        ipcRenderer.invoke('payment-check-refund-eligibility', paymentId),
    },
    refund: {
      create: (data: any) => ipcRenderer.invoke('refund-create', data),
      update: (refundId: number, data: any) => ipcRenderer.invoke('refund-update', refundId, data),
    },
    membershipType: {
      getAll: () => ipcRenderer.invoke('membership-type-get-all'),
      create: (data: any) => ipcRenderer.invoke('membership-type-create', data),
    },
    ptPackage: {
      getAll: () => ipcRenderer.invoke('pt-package-get-all'),
    },
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('database-query', sql, params),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app-version'),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 디버그: 실제로 노출되는 함수들 확인
console.log('🔍 [Preload] electronAPI.database.member 객체:', electronAPI.database.member);
console.log('🔍 [Preload] getStats 함수 타입:', typeof electronAPI.database.member.getStats);
console.log('🔍 [Preload] debugSchema 함수 타입:', typeof electronAPI.database.member.debugSchema);
console.log('🔍 [Preload] fixSchema 함수 타입:', typeof electronAPI.database.member.fixSchema);

// Also expose for compatibility
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
