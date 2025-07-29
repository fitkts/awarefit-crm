import {
  Calculator,
  CreditCard,
  History,
  Save,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SalaryAdjustmentInput, Staff, StaffSalaryHistory } from '../../types/staff';
import { useToastHelpers } from '../common/Toast';

interface SalaryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSalaryUpdated: () => void;
}

const SalaryManagementModal: React.FC<SalaryManagementModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSalaryUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState<StaffSalaryHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    new_salary: '',
    adjustment_reason: '',
    effective_date: new Date().toISOString().split('T')[0],
  });

  // 계산된 값들
  const [calculations, setCalculations] = useState({
    adjustment_amount: 0,
    adjustment_percentage: 0,
    monthly_difference: 0,
  });

  const { showSuccess, showError } = useToastHelpers();

  // 급여 이력 로드
  useEffect(() => {
    if (staff && isOpen) {
      loadSalaryHistory();
      // 현재 급여를 기본값으로 설정
      if (staff.salary) {
        setFormData(prev => ({
          ...prev,
          new_salary: staff.salary!.toString(),
        }));
      }
    }
  }, [staff, isOpen]);

  // 급여 변경 시 계산 업데이트
  useEffect(() => {
    calculateAdjustment();
  }, [formData.new_salary]);

  const loadSalaryHistory = async () => {
    if (!staff) return;

    try {
      setHistoryLoading(true);
      const history = await window.electronAPI.database.staff.salaryHistory(staff.id);
      setSalaryHistory(history);
    } catch (error) {
      console.error('급여 이력 조회 실패:', error);
      showError('급여 이력을 불러오는데 실패했습니다.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const calculateAdjustment = () => {
    if (!staff?.salary || !formData.new_salary) {
      setCalculations({
        adjustment_amount: 0,
        adjustment_percentage: 0,
        monthly_difference: 0,
      });
      return;
    }

    const currentSalary = staff.salary;
    const newSalary = parseInt(formData.new_salary);
    const adjustmentAmount = newSalary - currentSalary;
    const adjustmentPercentage = currentSalary > 0 ? (adjustmentAmount / currentSalary) * 100 : 0;

    setCalculations({
      adjustment_amount: adjustmentAmount,
      adjustment_percentage: adjustmentPercentage,
      monthly_difference: adjustmentAmount,
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staff) return;

    // 유효성 검사
    const newSalary = parseInt(formData.new_salary);
    if (isNaN(newSalary) || newSalary < 0) {
      showError('올바른 급여 금액을 입력해주세요.');
      return;
    }

    if (newSalary === staff.salary) {
      showError('현재 급여와 동일한 금액입니다.');
      return;
    }

    if (!formData.effective_date) {
      showError('적용일을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);

      const adjustmentData: SalaryAdjustmentInput = {
        staff_id: staff.id,
        new_salary: newSalary,
        adjustment_reason: formData.adjustment_reason || '급여 조정',
        effective_date: formData.effective_date,
      };

      await window.electronAPI.database.staff.salaryAdjust(adjustmentData);

      showSuccess(
        `${staff.name}님의 급여가 ${calculations.adjustment_amount > 0 ? '인상' : '인하'}되었습니다. (${Math.abs(calculations.adjustment_percentage).toFixed(1)}%)`
      );

      onSalaryUpdated();
      onClose();
    } catch (error) {
      console.error('급여 조정 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(`급여 조정에 실패했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      new_salary: '',
      adjustment_reason: '',
      effective_date: new Date().toISOString().split('T')[0],
    });
    setCalculations({
      adjustment_amount: 0,
      adjustment_percentage: 0,
      monthly_difference: 0,
    });
    onClose();
  };

  // 모달 외부 클릭 핸들러
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // ESC 키 핸들러
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 급여 포맷 함수
  const formatSalary = (amount: number): string => {
    return `${amount.toLocaleString()}원`;
  };

  if (!isOpen || !staff) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">급여 관리</h2>
                <p className="text-green-100">
                  {staff.name} - {staff.position}
                  {(staff.phone || staff.email) && (
                    <span className="text-gray-500 text-sm ml-2">
                      ({staff.phone || staff.email})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* 좌측: 급여 조정 폼 */}
          <div className="lg:w-1/2 p-6 border-r border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-green-600" />
              급여 조정
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 현재 급여 표시 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">현재 급여</label>
                <div className="text-2xl font-bold text-gray-900">
                  {staff.salary ? formatSalary(staff.salary) : '미설정'}
                </div>
              </div>

              {/* 신규 급여 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">신규 급여 *</label>
                <input
                  type="number"
                  value={formData.new_salary}
                  onChange={e => handleInputChange('new_salary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="예: 3000000"
                  required
                />
              </div>

              {/* 조정 사유 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">조정 사유</label>
                <textarea
                  value={formData.adjustment_reason}
                  onChange={e => handleInputChange('adjustment_reason', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="급여 조정 사유를 입력하세요"
                  rows={3}
                />
              </div>

              {/* 적용일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">적용일 *</label>
                <input
                  type="date"
                  value={formData.effective_date}
                  onChange={e => handleInputChange('effective_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              {/* 계산 결과 */}
              {formData.new_salary && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">조정 내역</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">금액 변화</span>
                      <div className="flex items-center">
                        {calculations.adjustment_amount > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : calculations.adjustment_amount < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        ) : null}
                        <span
                          className={`font-medium ${
                            calculations.adjustment_amount > 0
                              ? 'text-green-600'
                              : calculations.adjustment_amount < 0
                                ? 'text-red-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {calculations.adjustment_amount > 0 ? '+' : ''}
                          {formatSalary(calculations.adjustment_amount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">변화율</span>
                      <span
                        className={`font-medium ${
                          calculations.adjustment_percentage > 0
                            ? 'text-green-600'
                            : calculations.adjustment_percentage < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {calculations.adjustment_percentage > 0 ? '+' : ''}
                        {calculations.adjustment_percentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={loading || !formData.new_salary}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? '처리 중...' : '급여 조정 적용'}
              </button>
            </form>
          </div>

          {/* 우측: 급여 이력 */}
          <div className="lg:w-1/2 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <History className="w-5 h-5 mr-2 text-blue-600" />
              급여 조정 이력
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : salaryHistory.length > 0 ? (
                salaryHistory.map(history => (
                  <div
                    key={history.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {history.adjustment_amount > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                        ) : history.adjustment_amount < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
                        ) : (
                          <User className="w-4 h-4 text-blue-500 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {history.previous_salary
                            ? `${formatSalary(history.previous_salary)} → ${formatSalary(history.new_salary)}`
                            : `${formatSalary(history.new_salary)} (신규 책정)`}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          history.adjustment_amount > 0
                            ? 'text-green-600'
                            : history.adjustment_amount < 0
                              ? 'text-red-600'
                              : 'text-blue-600'
                        }`}
                      >
                        {history.adjustment_amount > 0 ? '+' : ''}
                        {formatSalary(history.adjustment_amount)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>{formatDate(history.effective_date)}</p>
                      {history.adjustment_reason && (
                        <p className="mt-1">{history.adjustment_reason}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">급여 조정 이력이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryManagementModal;
