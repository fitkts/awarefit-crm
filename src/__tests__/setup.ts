import '@testing-library/jest-dom';

// Mock Electron API
const mockElectronAPI = {
  database: {
    member: {
      getAll: jest.fn().mockResolvedValue([]),
      getStats: jest.fn().mockResolvedValue({ total: 0, active: 0, inactive: 0 }),
      create: jest.fn().mockResolvedValue({ success: true }),
      update: jest.fn().mockResolvedValue({ success: true }),
      delete: jest.fn().mockResolvedValue({ success: true }),
      getDetail: jest.fn().mockResolvedValue(null),
    },
    staff: {
      getAll: jest.fn().mockResolvedValue([]),
      getStats: jest.fn().mockResolvedValue({ total: 0, active: 0, inactive: 0 }),
      create: jest.fn().mockResolvedValue({ success: true }),
      update: jest.fn().mockResolvedValue({ success: true }),
      delete: jest.fn().mockResolvedValue({ success: true }),
      getDetail: jest.fn().mockResolvedValue(null),
    },
    payment: {
      getAll: jest.fn().mockResolvedValue([]),
      getStats: jest.fn().mockResolvedValue({ total: 0, totalAmount: 0 }),
      create: jest.fn().mockResolvedValue({ success: true }),
      update: jest.fn().mockResolvedValue({ success: true }),
      delete: jest.fn().mockResolvedValue({ success: true }),
      getDetail: jest.fn().mockResolvedValue(null),
    },
  },
};

// Window 객체에 electronAPI 추가
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// Console error/warning 억제 (테스트 환경에서만)
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') || args[0].includes('componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// IntersectionObserver Mock (일부 컴포넌트에서 사용할 수 있음)
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

  disconnect(): void {}
  observe(_target: Element): void {}
  unobserve(_target: Element): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
// jsdom 환경에서 전역에 주입
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).IntersectionObserver = MockIntersectionObserver as any;

// ResizeObserver Mock
class MockResizeObserver implements ResizeObserver {
  constructor(_callback?: ResizeObserverCallback) {}
  disconnect(): void {}
  observe(_target: Element, _options?: ResizeObserverOptions): void {}
  unobserve(_target: Element): void {}
}
// jsdom 환경에서 전역에 주입
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).ResizeObserver = MockResizeObserver as any;

// matchMedia Mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
