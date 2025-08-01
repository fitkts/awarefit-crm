import { AlertCircle, CreditCard, Plus, RefreshCw, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import PaymentDetailModal from '../components/payment/PaymentDetailModal';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentSearchFilter from '../components/payment/PaymentSearchFilter';
import PaymentStats from '../components/payment/PaymentStats';
import PaymentTable from '../components/payment/PaymentTable';
import RefundModal from '../components/payment/RefundModal';
import {
    CreatePaymentInput,
    Payment,
    PaymentDetail,
    PaymentSearchFilter as PaymentSearchFilterType,
    PaymentSortOption,
    UpdatePaymentInput,
} from '../types/payment';

// 간단한 Toast 컴포넌트
const Toast: React.FC<{
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}> = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg`}
    >
      <div className="flex items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const PaymentPage: React.FC = () => {
  // 상태 관리
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // 상세보기 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  // 환불 모달 상태
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundPayment, setRefundPayment] = useState<PaymentDetail | null>(null);
  const [isRefundLoading, setIsRefundLoading] = useState(false);

  // 검색 및 필터
  const [searchFilter, setSearchFilter] = useState<PaymentSearchFilterType>({
    payment_date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 최근 30일
    payment_date_to: new Date().toISOString().split('T')[0],
  });

  // 정렬
  const [sortOption, setSortOption] = useState<PaymentSortOption>({
    field: 'payment_date',
    direction: 'desc',
  });

  // 통계
  const [stats, setStats] = useState<any | null>(null);

  // 토스트
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  // 현재 직원 ID (실제로는 로그인 시스템에서 가져와야 함)
  const currentStaffId = 1; // 임시값

  // 초기 데이터 로드
  useEffect(() => {
    loadPayments();
    loadStats();
  }, [searchFilter, sortOption]);

  // 결제 목록 로드
  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.database.payment.getAll(searchFilter);
      setPayments(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('결제 목록 로드 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`결제 목록을 불러오는데 실패했습니다: ${errorMessage}`);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [searchFilter]);

  // 통계 데이터 로드
  const loadStats = useCallback(async () => {
    try {
      const result = await window.electronAPI.database.payment.getStats();

      // PaymentStats 컴포넌트에 맞는 데이터 구조로 변환
      const statsData = {
        todayRevenue: {
          amount: result?.today_amount || 0,
          count: result?.today_payments || 0,
        },
        monthlyRevenue: {
          amount: result?.month_amount || 0,
          count: result?.month_payments || 0,
        },
        pendingRefunds: {
          amount: 0, // API에서 제공되면 추가
          count: result?.pending_refunds || 0,
        },
        expiringMemberships: {
          count: result?.expiring_soon || 0,
          daysLeft: 30,
        },
        paymentMethods: {
          cash: result?.by_method?.['현금']?.amount || 0,
          card: result?.by_method?.['카드']?.amount || 0,
          transfer: result?.by_method?.['계좌이체']?.amount || 0,
          other: result?.by_method?.['기타']?.amount || 0,
        },
        topPaymentTypes: {
          membership: result?.by_type?.membership?.amount || 0,
          pt: result?.by_type?.pt?.amount || 0,
          other: result?.by_type?.other?.amount || 0,
        },
      };

      setStats(statsData);
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  }, []);

  // 토스트 표시
  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ show: true, message, type });
  };

  // 토스트 닫기
  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // 결제 폼 처리
  const handleCreatePayment = () => {
    setSelectedPayment(null);
    setIsFormOpen(true);
  };

  const handleEditPayment = (payment: PaymentDetail) => {
    setSelectedPayment(payment);
    setIsFormOpen(true);
  };

  const handleViewPayment = (payment: PaymentDetail) => {
    setSelectedPaymentId(payment.id);
    setIsDetailModalOpen(true);
  };

  const handleSubmitPayment = async (data: CreatePaymentInput | UpdatePaymentInput) => {
    setIsFormLoading(true);
    try {
      console.log('🔍 [Payment] handleSubmitPayment 호출됨');
      console.log('🔍 [Payment] selectedPayment:', selectedPayment);
      console.log('🔍 [Payment] 전달받은 data:', data);
      console.log('🔍 [Payment] data에 id가 있는가:', 'id' in data);
      
      if (selectedPayment && 'id' in data) {
        console.log('✅ [Payment] 수정 모드 - payment.update 호출');
        await window.electronAPI.database.payment.update(data.id, data);
        showToast('결제 정보가 수정되었습니다.', 'success');
      } else {
        console.log('✅ [Payment] 생성 모드 - payment.create 호출');
        await window.electronAPI.database.payment.create(data as CreatePaymentInput);
        showToast('새 결제가 등록되었습니다.', 'success');
      }
      setIsFormOpen(false);
      loadPayments();
      loadStats();
    } catch (error) {
      console.error('결제 저장 실패:', error);
      showToast('결제 저장에 실패했습니다.', 'error');
    } finally {
      setIsFormLoading(false);
    }
  };

  // 결제 취소/환불
  const handleCancelPayment = async (paymentId: number) => {
    if (!confirm('이 결제를 취소하시겠습니까?')) return;

    try {
      await window.electronAPI.database.payment.cancel(paymentId, currentStaffId, '관리자 요청');
      showToast('결제가 취소되었습니다.', 'success');
      loadPayments();
      loadStats();
    } catch (error) {
      console.error('결제 취소 실패:', error);
      showToast('결제 취소에 실패했습니다.', 'error');
    }
  };

  // 환불 처리 핸들러들
  const handleRefundFromDetail = (payment: PaymentDetail) => {
    setRefundPayment(payment);
    setIsDetailModalOpen(false);
    setIsRefundModalOpen(true);
  };

  const handleRefundSubmit = async (refundData: any) => {
    setIsRefundLoading(true);
    try {
      await window.electronAPI.database.refund.create(refundData);
      showToast('환불 신청이 완료되었습니다.', 'success');
      loadPayments();
      loadStats();
    } catch (error) {
      console.error('환불 신청 실패:', error);
      showToast('환불 신청에 실패했습니다.', 'error');
    } finally {
      setIsRefundLoading(false);
    }
  };

  // 필터 초기화
  const handleResetFilter = () => {
    setSearchFilter({
      payment_date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      payment_date_to: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">결제 관리</h1>
              <p className="text-sm text-gray-600">회원권, PT, 기타 서비스 결제 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadPayments}
              disabled={loading}
              className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
            <button
              onClick={handleCreatePayment}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />새 결제
            </button>
          </div>
        </div>
      </div>

      {/* 통계 대시보드 */}
      {stats && (
        <div className="px-6 py-4">
          <PaymentStats data={stats} loading={loading} onRefresh={loadStats} />
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="px-6 py-2">
        <PaymentSearchFilter
          filter={searchFilter}
          onFilterChange={setSearchFilter}
          onReset={handleResetFilter}
          loading={loading}
        />
      </div>

      {/* 결제 목록 테이블 */}
      <div className="flex-1 px-6 pb-6">
        {error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-center py-12">
              <AlertCircle className="w-6 h-6 text-red-400 mr-2" />
              <span className="text-red-600">{error}</span>
            </div>
          </div>
        ) : (
          <PaymentTable
            payments={payments}
            loading={loading}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onEdit={handleEditPayment}
            onView={handleViewPayment}
            onCancel={handleCancelPayment}
          />
        )}
      </div>

      {/* 결제 폼 모달 */}
      <PaymentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitPayment}
        payment={selectedPayment || undefined}
        isLoading={isFormLoading}
      />

      {/* 결제 상세보기 모달 */}
      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        paymentId={selectedPaymentId}
        onEdit={handleEditPayment}
        onRefund={handleRefundFromDetail}
      />

      {/* 환불 처리 모달 */}
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        payment={refundPayment}
        onSubmit={handleRefundSubmit}
        isLoading={isRefundLoading}
        currentStaffId={currentStaffId}
      />

      {/* 토스트 알림 */}
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
};

export default PaymentPage;
