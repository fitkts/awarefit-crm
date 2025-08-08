import {
    AlertTriangle,
    Calculator,
    CreditCard,
    DollarSign,
    FileText,
    Lock,
    RefreshCw,
    X,
} from '@/utils/lucide-shim';
import React, { useEffect, useState } from 'react';
import { PaymentDetail, RefundEligibility } from '../../types/payment';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentDetail | null;
  onSubmit: (refundData: RefundFormData) => Promise<void>;
  isLoading?: boolean;
  currentStaffId: number; // 현재 로그인한 직원 ID
}

interface RefundFormData {
  payment_id: number;
  requested_by: number;
  refund_amount: number;
  reason: string;
  refund_method: 'account_transfer' | 'card_cancel' | 'cash';
  account_info?: string;
  notes?: string;
}

const RefundModal: React.FC<RefundModalProps> = ({
  isOpen,
  onClose,
  payment,
  onSubmit,
  isLoading = false,
  currentStaffId,
}) => {
  const [formData, setFormData] = useState<RefundFormData>({
    payment_id: 0,
    requested_by: currentStaffId,
    refund_amount: 0,
    reason: '',
    refund_method: 'cash',
    account_info: '',
    notes: '',
  });

  const [eligibility, setEligibility] = useState<RefundEligibility | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen && payment) {
      setFormData({
        payment_id: payment.id,
        requested_by: currentStaffId,
        refund_amount: payment.amount, // 전액 환불이 기본값
        reason: '',
        refund_method: 'cash',
        account_info: '',
        notes: '',
      });
      checkRefundEligibility(payment.id);
      setErrors({});
    }
  }, [isOpen, payment, currentStaffId]);

  // 환불 가능 여부 확인
  const checkRefundEligibility = async (paymentId: number) => {
    setCheckingEligibility(true);
    try {
      const result = await window.electronAPI.database.payment.checkRefundEligibility(paymentId);
      setEligibility(result);

      if (result.eligible) {
        // 권장 환불 방식 설정
        setFormData(prev => ({
          ...prev,
          refund_method: result.suggested_method,
          refund_amount: Math.min(prev.refund_amount, result.max_refund_amount),
        }));
      }
    } catch (error) {
      console.error('환불 가능 여부 확인 실패:', error);
      setEligibility({
        eligible: false,
        reason: '환불 가능 여부를 확인할 수 없습니다.',
        max_refund_amount: 0,
        suggested_method: 'cash',
      });
    } finally {
      setCheckingEligibility(false);
    }
  };

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: keyof RefundFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = '환불 사유를 입력해주세요.';
    }

    if (formData.refund_amount <= 0) {
      newErrors.refund_amount = '환불 금액은 0보다 커야 합니다.';
    } else if (eligibility && formData.refund_amount > eligibility.max_refund_amount) {
      newErrors.refund_amount = `최대 환불 가능 금액은 ${formatCurrency(eligibility.max_refund_amount)}입니다.`;
    }

    if (formData.refund_method === 'account_transfer' && !formData.account_info?.trim()) {
      newErrors.account_info = '계좌 정보를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!payment || !eligibility?.eligible) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('환불 처리 실패:', error);
    }
  };

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  // 환불 방식 텍스트
  const getRefundMethodText = (method: string) => {
    const texts = {
      account_transfer: '계좌 이체',
      card_cancel: '카드 취소',
      cash: '현금',
    };
    return texts[method as keyof typeof texts] || method;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
          <div className="flex items-center">
            <RefreshCw className="w-6 h-6 text-yellow-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-100">환불 처리</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {payment && (
            <div className="space-y-6">
              {/* 결제 정보 요약 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">결제 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">결제번호:</span>
                    <span className="ml-2 font-medium">{payment.payment_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">회원명:</span>
                    <span className="ml-2 font-medium">{payment.member_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">결제 금액:</span>
                    <span className="ml-2 font-bold text-lg">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">결제 방식:</span>
                    <span className="ml-2 font-medium">{payment.payment_method}</span>
                  </div>
                </div>
              </div>

              {/* 환불 가능 여부 */}
              {checkingEligibility ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                  <span className="text-gray-600">환불 가능 여부 확인 중...</span>
                </div>
              ) : eligibility ? (
                <div
                  className={`p-4 rounded-lg ${
                    eligibility.eligible
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    {eligibility.eligible ? (
                      <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <h3
                      className={`font-medium ${
                        eligibility.eligible ? 'text-green-900' : 'text-red-900'
                      }`}
                    >
                      {eligibility.eligible ? '환불 가능' : '환불 불가'}
                    </h3>
                  </div>
                  {eligibility.eligible ? (
                    <p className="mt-2 text-sm text-green-800">
                      최대 환불 가능 금액:{' '}
                      <strong>{formatCurrency(eligibility.max_refund_amount)}</strong>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-red-800">{eligibility.reason}</p>
                  )}
                </div>
              ) : null}

              {/* 환불 가능한 경우에만 폼 표시 */}
              {eligibility?.eligible && (
                <>
                  {/* 환불 금액 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calculator className="w-4 h-4 inline mr-1" />
                      환불 금액 *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.refund_amount}
                        onChange={e =>
                          handleInputChange('refund_amount', parseInt(e.target.value) || 0)
                        }
                        max={eligibility.max_refund_amount}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.refund_amount ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="환불할 금액을 입력하세요"
                      />
                      <div className="absolute right-3 top-2 text-gray-500">원</div>
                    </div>
                    {errors.refund_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.refund_amount}</p>
                    )}
                    <p className="mt-1 text-sm text-blue-600">
                      {formatCurrency(formData.refund_amount)}
                    </p>
                  </div>

                  {/* 환불 방식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CreditCard className="w-4 h-4 inline mr-1" />
                      환불 방식 *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['cash', 'card_cancel', 'account_transfer'] as const).map(method => (
                        <label key={method} className="flex items-center">
                          <input
                            type="radio"
                            name="refund_method"
                            value={method}
                            checked={formData.refund_method === method}
                            onChange={e => handleInputChange('refund_method', e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm">{getRefundMethodText(method)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 계좌 정보 (계좌 이체 선택 시) */}
                  {formData.refund_method === 'account_transfer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Lock className="w-4 h-4 inline mr-1" />
                        환불 계좌 정보 *
                      </label>
                      <textarea
                        value={formData.account_info}
                        onChange={e => handleInputChange('account_info', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.account_info ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="은행명, 계좌번호, 예금주명을 입력하세요"
                      />
                      {errors.account_info && (
                        <p className="mt-1 text-sm text-red-600">{errors.account_info}</p>
                      )}
                    </div>
                  )}

                  {/* 환불 사유 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      환불 사유 *
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={e => handleInputChange('reason', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.reason ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="환불 사유를 상세히 입력하세요"
                    />
                    {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
                  </div>

                  {/* 추가 메모 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      추가 메모
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={e => handleInputChange('notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="추가 메모가 있으면 입력하세요"
                    />
                  </div>

                  {/* 주의사항 */}
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">환불 처리 주의사항</h4>
                        <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                          <li>• 환불 처리 후에는 취소할 수 없습니다.</li>
                          <li>• 카드 취소의 경우 카드사 정책에 따라 처리됩니다.</li>
                          <li>• 계좌 이체는 관리자 승인 후 처리됩니다.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-dark-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-dark-300 bg-gray-100 dark:bg-dark-700 rounded-md hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
              disabled={isLoading}
            >
              취소
            </button>
            {eligibility?.eligible && (
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '환불 신청'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundModal;
