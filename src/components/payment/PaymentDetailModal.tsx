import {
    CreditCard,
    DollarSign,
    FileText,
    History,
    Package,
    RefreshCw,
    User,
    X,
} from '@/utils/lucide-shim';
import React, { useEffect, useState } from 'react';
import { PaymentDetail } from '../../types/payment';

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: number | null;
  onEdit?: (payment: PaymentDetail) => void;
  onRefund?: (payment: PaymentDetail) => void;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  isOpen,
  onClose,
  paymentId,
  onEdit,
  onRefund,
}) => {
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 결제 상세 정보 로드
  useEffect(() => {
    if (isOpen && paymentId) {
      loadPaymentDetail();
    }
  }, [isOpen, paymentId]);

  const loadPaymentDetail = async () => {
    if (!paymentId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.database.payment.getById(paymentId);
      setPayment(result);
    } catch (error) {
      console.error('결제 상세 조회 실패:', error);
      setError('결제 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 날짜시간 포맷팅
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 결제 상태 스타일
  const getStatusStyle = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      refunded: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-blue-100 text-blue-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  // 결제 상태 텍스트
  const getStatusText = (status: string) => {
    const texts = {
      completed: '완료',
      refunded: '환불',
      cancelled: '취소',
      pending: '대기',
    };
    return texts[status as keyof typeof texts] || '알 수 없음';
  };

  // 결제 유형 텍스트
  const getPaymentTypeText = (type: string) => {
    const texts = {
      membership: '회원권',
      pt: 'PT',
      other: '기타',
    };
    return texts[type as keyof typeof texts] || type;
  };

  // 환불 상태 텍스트
  const getRefundStatusText = (status: string) => {
    const texts = {
      pending: '대기',
      approved: '승인',
      rejected: '거부',
      processed: '처리완료',
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-600">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-100">
              결제 상세 정보
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400 dark:text-dark-400 mr-2" />
              <span className="text-gray-600 dark:text-dark-400">로딩 중...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-600">
              <span>{error}</span>
            </div>
          ) : payment ? (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  기본 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      결제번호
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                      {payment.payment_number}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      결제일시
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                      {formatDate(payment.payment_date)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      결제 유형
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                      {getPaymentTypeText(payment.payment_type)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      상태
                    </label>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(payment.status)}`}
                    >
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      결제 금액
                    </label>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-dark-100">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      결제 방식
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                      {payment.payment_method}
                    </p>
                  </div>
                </div>
              </div>

              {/* 회원 정보 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  회원 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      회원명
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                      {payment.member_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      회원번호
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                      {payment.member_phone || payment.member_email || '연락처 없음'}
                    </p>
                  </div>
                  {payment.member_phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                        전화번호
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                        {payment.member_phone}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      담당 직원
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                      {payment.staff_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* 상품 정보 */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  상품 정보
                </h3>
                {payment.membership_type_name && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      회원권
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                      {payment.membership_type_name}
                    </p>
                  </div>
                )}
                {payment.pt_package_name && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      PT 패키지
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                      {payment.pt_package_name}
                    </p>
                  </div>
                )}
                {payment.expiry_date && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      만료일
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">
                      {formatDate(payment.expiry_date)}
                    </p>
                  </div>
                )}
                {payment.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                      메모
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-100">{payment.notes}</p>
                  </div>
                )}
              </div>

              {/* 결제 항목들 */}
              {payment.items && payment.items.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    결제 항목
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
                      <thead className="bg-gray-50 dark:bg-dark-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                            항목명
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                            수량
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                            단가
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                            총액
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
                        {payment.items.map(item => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                              {item.item_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-100">
                              {formatCurrency(item.total_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 환불 정보 */}
              {payment.refunds && payment.refunds.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    환불 정보
                  </h3>
                  <div className="space-y-3">
                    {payment.refunds.map(refund => (
                      <div
                        key={refund.id}
                        className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-dark-100">
                              환불 금액: {formatCurrency(refund.refund_amount)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-dark-300">
                              사유: {refund.reason}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-dark-300">
                              신청일: {formatDateTime(refund.requested_at)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              refund.status === 'processed'
                                ? 'bg-green-100 text-green-800'
                                : refund.status === 'approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : refund.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {getRefundStatusText(refund.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 결제 이력 */}
              {payment.history && payment.history.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    결제 이력
                  </h3>
                  <div className="space-y-3">
                    {payment.history.map(history => (
                      <div key={history.id} className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-dark-100">
                              {history.action === 'created'
                                ? '결제 생성'
                                : history.action === 'updated'
                                  ? '결제 수정'
                                  : history.action === 'refund_requested'
                                    ? '환불 신청'
                                    : history.action === 'refunded'
                                      ? '환불 완료'
                                      : history.action === 'cancelled'
                                        ? '결제 취소'
                                        : history.action}
                            </p>
                            {history.notes && (
                              <p className="text-sm text-gray-600 dark:text-dark-300">
                                {history.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-dark-300">
                              {formatDateTime(history.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* 하단 버튼 */}
        {payment && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-600">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-dark-300 bg-gray-100 dark:bg-dark-700 rounded-md hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
            >
              닫기
            </button>
            {onEdit && payment.status === 'completed' && (
              <button
                onClick={() => onEdit(payment)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                수정
              </button>
            )}
            {onRefund && payment.status === 'completed' && (
              <button
                onClick={() => onRefund(payment)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                환불 처리
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetailModal;
