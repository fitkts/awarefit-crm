import {
  ArrowUpDown,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  RefreshCw,
  User,
  X,
} from 'lucide-react';
import React from 'react';
import { PaymentDetail, PaymentSortOption } from '../../types/payment';

interface PaymentTableProps {
  payments: PaymentDetail[];
  loading?: boolean;
  sortOption: PaymentSortOption;
  onSortChange: (sort: PaymentSortOption) => void;
  onEdit: (payment: PaymentDetail) => void;
  onView: (payment: PaymentDetail) => void;
  onCancel: (paymentId: number) => void;
}

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

// 결제 상태 아이콘
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'refunded':
      return <RefreshCw className="w-4 h-4" />;
    case 'cancelled':
      return <X className="w-4 h-4" />;
    case 'pending':
      return <Clock className="w-4 h-4" />;
    default:
      return <CheckCircle className="w-4 h-4" />;
  }
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

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  loading = false,
  sortOption,
  onSortChange,
  onEdit,
  onView,
  onCancel,
}) => {
  // 정렬 아이콘 표시
  const getSortIcon = (field: string) => {
    if (sortOption.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOption.direction === 'asc' ? (
      <ArrowUpDown className="w-4 h-4 text-blue-600 rotate-180" />
    ) : (
      <ArrowUpDown className="w-4 h-4 text-blue-600" />
    );
  };

  // 정렬 변경 핸들러
  const handleSort = (field: PaymentSortOption['field']) => {
    const direction = sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction });
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">결제 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <CreditCard className="w-6 h-6 text-gray-400 mr-2" />
          <span className="text-gray-600">결제 내역이 없습니다.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* 결제일시 */}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('payment_date')}
              >
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  결제일시
                  {getSortIcon('payment_date')}
                </div>
              </th>

              {/* 회원명 */}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('member_name')}
              >
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  회원명
                  {getSortIcon('member_name')}
                </div>
              </th>

              {/* 결제 유형 */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                결제 유형
              </th>

              {/* 상품명 */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상품명
              </th>

              {/* 금액 */}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  금액
                  {getSortIcon('amount')}
                </div>
              </th>

              {/* 결제 방식 */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                결제 방식
              </th>

              {/* 담당 직원 */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                담당 직원
              </th>

              {/* 상태 */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>

              {/* 액션 */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map(payment => (
              <React.Fragment key={payment.id}>
                <tr className="hover:bg-gray-50">
                  {/* 결제일시 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.payment_date)}
                  </td>

                  {/* 회원명 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{payment.member_name}</div>
                      <div className="text-sm text-gray-500">{payment.member_number}</div>
                    </div>
                  </td>

                  {/* 결제 유형 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getPaymentTypeText(payment.payment_type)}
                  </td>

                  {/* 상품명 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.membership_type_name || payment.pt_package_name || '-'}
                  </td>

                  {/* 금액 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>

                  {/* 결제 방식 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.payment_method}
                  </td>

                  {/* 담당 직원 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.staff_name}
                  </td>

                  {/* 상태 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(payment.status)}`}
                    >
                      {getStatusIcon(payment.status)}
                      <span className="ml-1">{getStatusText(payment.status)}</span>
                    </span>
                  </td>

                  {/* 액션 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(payment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="상세보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(payment)}
                        className="text-green-600 hover:text-green-900"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {payment.status === 'completed' && (
                        <button
                          onClick={() => onCancel(payment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="취소/환불"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTable;
