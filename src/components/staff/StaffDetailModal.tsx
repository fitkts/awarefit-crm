import {
  Briefcase,
  Calendar,
  Clock,
  CreditCard,
  Edit,
  History,
  Mail,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Staff, StaffDetail } from '../../types/staff';
import SalaryManagementModal from './SalaryManagementModal';

interface StaffDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onEdit: (staff: Staff) => void;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({ isOpen, onClose, staff, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const [staffDetail, setStaffDetail] = useState<StaffDetail | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'role' | 'salary' | 'performance' | 'activity'
  >('overview');
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // 직원 상세 정보 로드
  useEffect(() => {
    if (staff && isOpen) {
      loadStaffDetail();
    }
  }, [staff, isOpen]);

  const loadStaffDetail = async () => {
    try {
      setLoading(true);

      // 급여 이력 조회
      const salaryHistory = await window.electronAPI.database.staff.salaryHistory(staff!.id);

      // 나이 계산
      const calculateAge = (birthDate?: string | null): number | undefined => {
        if (!birthDate) return undefined;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      };

      // 근속 기간 계산 (개월)
      const calculateTenureMonths = (hireDate: string): number => {
        const today = new Date();
        const hire = new Date(hireDate);
        const diffTime = Math.abs(today.getTime() - hire.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
      };

      // 임시 목업 데이터 (실제로는 API에서 가져올 데이터)
      const mockDetail: StaffDetail = {
        ...staff!,
        age: calculateAge(staff!.birth_date),
        tenure_months: calculateTenureMonths(staff!.hire_date),
        role: null, // TODO: 역할 정보 API 연동
        salary_history: salaryHistory,
        managed_members_count: Math.floor(Math.random() * 50) + 10, // 임시
        total_sales_amount: Math.floor(Math.random() * 50000000) + 10000000, // 임시
        last_salary_adjustment: salaryHistory.length > 0 ? salaryHistory[0] : null,
      };

      setStaffDetail(mockDetail);
    } catch (error) {
      console.error('직원 상세 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 급여 관리 모달 열기
  const handleSalaryManagement = () => {
    setIsSalaryModalOpen(true);
  };

  // 급여 업데이트 후 콜백
  const handleSalaryUpdated = () => {
    loadStaffDetail(); // 데이터 새로고침
  };

  // 모달 외부 클릭 핸들러
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC 키 핸들러
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
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
  }, [isOpen, onClose]);

  // 날짜 포맷 함수
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '미등록';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 연락처 포맷 함수
  const formatPhoneNumber = (phone?: string | null): string => {
    if (!phone) return '미등록';
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  // 이메일 포맷 함수
  const formatEmail = (email?: string | null): string => {
    return email || '미등록';
  };

  // 주소 포맷 함수
  const formatAddress = (address?: string | null): string => {
    return address || '미등록';
  };

  // 급여 포맷 함수
  const formatSalary = (amount?: number | null): string => {
    if (!amount) return '미설정';
    return `${amount.toLocaleString()}원`;
  };

  // 근속 기간 포맷 함수
  const formatTenure = (months?: number): string => {
    if (!months) return '계산 불가';
    if (months < 12) {
      return `${months}개월`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years}년 ${remainingMonths}개월` : `${years}년`;
    }
  };

  if (!isOpen || !staff) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{staff.name}</h2>
                <p className="text-blue-100">{staff.phone || staff.email || '연락처 없음'}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {staff.position}
                  </span>
                  {staff.department && (
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                      {staff.department}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      staff.is_active ? 'bg-green-500 bg-opacity-80' : 'bg-red-500 bg-opacity-80'
                    }`}
                  >
                    {staff.is_active ? '활성' : '비활성'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(staff)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
                title="직원 정보 수정"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: '개요', icon: User },
              { id: 'role', label: '역할 & 권한', icon: Shield },
              { id: 'salary', label: '급여 이력', icon: CreditCard },
              { id: 'performance', label: '성과', icon: TrendingUp },
              { id: 'activity', label: '활동', icon: Clock },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-500">로딩 중...</span>
            </div>
          ) : (
            <>
              {/* 개요 탭 */}
              {activeTab === 'overview' && staffDetail && (
                <div className="p-6 space-y-6">
                  {/* 기본 정보 카드 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 개인 정보 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        개인 정보
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatPhoneNumber(staff.phone)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatEmail(staff.email)}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {staff.birth_date
                              ? `${formatDate(staff.birth_date)} (${staffDetail.age}세)`
                              : '미등록'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatAddress(staff.address)}
                          </span>
                        </div>
                        {staff.gender && (
                          <div className="flex items-center space-x-3">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{staff.gender}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 근무 정보 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" />
                        근무 정보
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">입사일</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(staff.hire_date)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">근속 기간</span>
                            <span className="text-lg font-bold text-blue-600">
                              {formatTenure(staffDetail.tenure_months)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">현재 급여</span>
                            <span className="text-lg font-bold text-green-600">
                              {formatSalary(staff.salary)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">부서</span>
                            <span className="text-sm text-gray-900">
                              {staff.department || '미설정'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 성과 정보 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        성과 정보
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">관리 회원 수</span>
                            <span className="text-lg font-bold text-purple-600">
                              {staffDetail.managed_members_count}명
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">총 매출 기여</span>
                            <span className="text-lg font-bold text-green-600">
                              {(staffDetail.total_sales_amount / 10000).toLocaleString()}만원
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">월 평균 매출</span>
                            <span className="text-sm text-gray-900">
                              {Math.round(
                                staffDetail.total_sales_amount /
                                  (staffDetail.tenure_months || 1) /
                                  10000
                              ).toLocaleString()}
                              만원
                            </span>
                          </div>
                        </div>
                        {/* 급여 관리 버튼 추가 */}
                        <div className="pt-2 border-t border-gray-200">
                          <button
                            onClick={handleSalaryManagement}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                            급여 관리
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 권한 정보 */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      시스템 권한
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            staff.can_manage_members ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></div>
                        <span className="text-sm text-gray-700">회원 관리</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            staff.can_manage_payments ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></div>
                        <span className="text-sm text-gray-700">결제 관리</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 급여 이력 탭 */}
              {activeTab === 'salary' && staffDetail && (
                <div className="p-6">
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <History className="w-5 h-5 mr-2" />
                        급여 조정 이력
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {staffDetail.salary_history.length > 0 ? (
                        staffDetail.salary_history.map(history => (
                          <div key={history.id} className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {history.previous_salary
                                    ? `${history.previous_salary.toLocaleString()}원 → ${history.new_salary.toLocaleString()}원`
                                    : `${history.new_salary.toLocaleString()}원 (신규 책정)`}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(history.effective_date)} •{' '}
                                  {history.adjustment_reason || '사유 없음'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`text-lg font-bold ${
                                    history.adjustment_amount > 0
                                      ? 'text-green-600'
                                      : history.adjustment_amount < 0
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                  }`}
                                >
                                  {history.adjustment_amount > 0 ? '+' : ''}
                                  {history.adjustment_amount.toLocaleString()}원
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center">
                          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">급여 조정 이력이 없습니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 기타 탭들 */}
              {(activeTab === 'role' ||
                activeTab === 'performance' ||
                activeTab === 'activity') && (
                <div className="p-6">
                  <div className="text-center py-12">
                    {activeTab === 'role' && (
                      <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    )}
                    {activeTab === 'performance' && (
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    )}
                    {activeTab === 'activity' && (
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {activeTab === 'role' && '역할 관리'}
                      {activeTab === 'performance' && '성과 분석'}
                      {activeTab === 'activity' && '활동 로그'}
                    </h3>
                    <p className="text-gray-600">해당 기능이 곧 추가될 예정입니다.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 급여 관리 모달 */}
      <SalaryManagementModal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        staff={staff}
        onSalaryUpdated={handleSalaryUpdated}
      />
    </div>
  );
};

export default StaffDetailModal;
