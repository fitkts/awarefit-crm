import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// 토스트 타입 정의
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
}

// 토스트 컨텍스트 타입
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

// 토스트 컨텍스트 생성
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 토스트 훅
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// 토스트 아이콘 매핑
const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

// 토스트 색상 매핑
const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

// 개별 토스트 컴포넌트
const ToastItem: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    if (toast.autoClose !== false) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration || 4000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [toast.id, toast.duration, toast.autoClose, onRemove]);

  return (
    <div
      className={`
        relative flex items-start space-x-3 p-4 rounded-lg border shadow-lg
        transform transition-all duration-300 ease-in-out
        ${toastColors[toast.type]}
      `}
    >
      <Icon className={`w-5 h-5 mt-0.5 ${iconColors[toast.type]}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && <p className="mt-1 text-sm opacity-90">{toast.message}</p>}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// 토스트 컨테이너 컴포넌트
const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// 토스트 프로바이더 컴포넌트
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 4000,
      autoClose: true,
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// 편의 함수들
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    showSuccess: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    showError: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    showWarning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    showInfo: (title: string, message?: string) => addToast({ type: 'info', title, message }),
  };
};
