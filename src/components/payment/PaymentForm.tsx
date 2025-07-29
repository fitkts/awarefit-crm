import { Calculator, CreditCard, Package, User, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { CreatePaymentInput, Payment, PaymentMethod, PaymentType } from '../../types/payment';

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentInput) => Promise<void>;
  payment?: Payment; // 수정 모드일 때 전달되는 기존 결제 데이터
  isLoading?: boolean;
}

interface MemberOption {
  id: number;
  name: string;
  member_number: string;
  phone?: string;
}

interface StaffOption {
  id: number;
  name: string;
  position: string;
}

interface MembershipTypeOption {
  id: number;
  name: string;
  duration_months: number;
  price: number;
}

interface PtPackageOption {
  id: number;
  name: string;
  session_count: number;
  price: number;
  validity_days: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  payment,
  isLoading = false,
}) => {
  // 상태 관리
  const [formData, setFormData] = useState<CreatePaymentInput>({
    member_id: 0,
    staff_id: 0,
    payment_type: 'membership',
    membership_type_id: undefined,
    pt_package_id: undefined,
    amount: 0,
    payment_method: '현금',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // 선택 옵션들
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipTypeOption[]>([]);
  const [ptPackages, setPtPackages] = useState<PtPackageOption[]>([]);

  // 로딩 상태
  const [loading, setLoading] = useState({
    members: false,
    staff: false,
    membershipTypes: false,
    ptPackages: false,
  });

  // 선택된 항목들
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);

  // 데이터 로드 함수들
  const loadMembers = useCallback(async () => {
    setLoading(prev => ({ ...prev, members: true }));
    try {
      const result = await window.electronAPI.database.member.getAll({ active: true });
      const memberOptions = result.map((member: any) => ({
        id: member.id,
        name: member.name,
        member_number: member.member_number,
        phone: member.phone,
      }));
      setMembers(memberOptions);
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
    } finally {
      setLoading(prev => ({ ...prev, members: false }));
    }
  }, []);

  const loadStaff = useCallback(async () => {
    setLoading(prev => ({ ...prev, staff: true }));
    try {
      const result = await window.electronAPI.database.staff.getAll({
        is_active: true,
        can_manage_payments: true,
      });
      const staffOptions = result.map((staff: any) => ({
        id: staff.id,
        name: staff.name,
        position: staff.position,
      }));
      setStaff(staffOptions);
    } catch (error) {
      console.error('직원 목록 조회 실패:', error);
    } finally {
      setLoading(prev => ({ ...prev, staff: false }));
    }
  }, []);

  const loadMembershipTypes = useCallback(async () => {
    setLoading(prev => ({ ...prev, membershipTypes: true }));
    try {
      const result = await window.electronAPI.database.membershipType.getAll();
      setMembershipTypes(result);
    } catch (error) {
      console.error('회원권 타입 조회 실패:', error);
    } finally {
      setLoading(prev => ({ ...prev, membershipTypes: false }));
    }
  }, []);

  const loadPtPackages = useCallback(async () => {
    setLoading(prev => ({ ...prev, ptPackages: true }));
    try {
      const result = await window.electronAPI.database.ptPackage.getAll();
      setPtPackages(result);
    } catch (error) {
      console.error('PT 패키지 조회 실패:', error);
    } finally {
      setLoading(prev => ({ ...prev, ptPackages: false }));
    }
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadMembers();
      loadStaff();
      loadMembershipTypes();
      loadPtPackages();
    }
  }, [isOpen, loadMembers, loadStaff, loadMembershipTypes, loadPtPackages]);

  // 기존 결제 데이터 로드 (수정 모드)
  useEffect(() => {
    if (payment) {
      setFormData({
        member_id: payment.member_id,
        staff_id: payment.staff_id,
        payment_type: payment.payment_type,
        membership_type_id: payment.membership_type_id || undefined,
        pt_package_id: payment.pt_package_id || undefined,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        notes: payment.notes || '',
      });
    } else {
      // 새 결제 폼 초기화
      setFormData({
        member_id: 0,
        staff_id: 0,
        payment_type: 'membership',
        membership_type_id: undefined,
        pt_package_id: undefined,
        amount: 0,
        payment_method: '현금',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [payment]);

  // 결제 유형 변경 시 금액 자동 계산
  useEffect(() => {
    let calculatedAmount = 0;

    if (formData.payment_type === 'membership' && formData.membership_type_id) {
      const selectedType = membershipTypes.find(type => type.id === formData.membership_type_id);
      if (selectedType) {
        calculatedAmount = selectedType.price;
      }
    } else if (formData.payment_type === 'pt' && formData.pt_package_id) {
      const selectedPackage = ptPackages.find(pkg => pkg.id === formData.pt_package_id);
      if (selectedPackage) {
        calculatedAmount = selectedPackage.price;
      }
    }

    if (calculatedAmount > 0) {
      setFormData(prev => ({ ...prev, amount: calculatedAmount }));
    }
  }, [
    formData.payment_type,
    formData.membership_type_id,
    formData.pt_package_id,
    membershipTypes,
    ptPackages,
  ]);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: keyof CreatePaymentInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 회원 선택 핸들러
  const handleMemberSelect = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    setSelectedMember(member || null);
    handleInputChange('member_id', memberId);
  };

  // 직원 선택 핸들러
  const handleStaffSelect = (staffId: number) => {
    handleInputChange('staff_id', staffId);
  };

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.member_id || !formData.staff_id) {
      alert('회원과 담당 직원을 선택해주세요.');
      return;
    }

    if (formData.amount <= 0) {
      alert('결제 금액을 입력해주세요.');
      return;
    }

    if (formData.payment_type === 'membership' && !formData.membership_type_id) {
      alert('회원권 종류를 선택해주세요.');
      return;
    }

    if (formData.payment_type === 'pt' && !formData.pt_package_id) {
      alert('PT 패키지를 선택해주세요.');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('결제 저장 실패:', error);
      alert('결제 저장에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              {payment ? '결제 정보 수정' : '새 결제 등록'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 폼 콘텐츠 */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* 회원 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                회원 선택 *
              </label>
              <select
                value={formData.member_id || ''}
                onChange={e => handleMemberSelect(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading.members}
                required
              >
                <option value="">
                  {loading.members ? '회원 목록 로딩 중...' : '회원을 선택하세요'}
                </option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.phone && `- ${member.phone}`}
                  </option>
                ))}
              </select>
              {selectedMember && (
                <p className="mt-1 text-sm text-gray-600">
                  선택된 회원: {selectedMember.name}{' '}
                  {selectedMember.phone && `- ${selectedMember.phone}`}
                </p>
              )}
            </div>

            {/* 담당 직원 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">담당 직원 *</label>
              <select
                value={formData.staff_id || ''}
                onChange={e => handleStaffSelect(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading.staff}
                required
              >
                <option value="">
                  {loading.staff ? '직원 목록 로딩 중...' : '담당 직원을 선택하세요'}
                </option>
                {staff.map(staffMember => (
                  <option key={staffMember.id} value={staffMember.id}>
                    {staffMember.name} ({staffMember.position})
                  </option>
                ))}
              </select>
            </div>

            {/* 결제 유형 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                결제 유형 *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['membership', 'pt', 'other'] as PaymentType[]).map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="payment_type"
                      value={type}
                      checked={formData.payment_type === type}
                      onChange={e =>
                        handleInputChange('payment_type', e.target.value as PaymentType)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {type === 'membership' ? '회원권' : type === 'pt' ? 'PT' : '기타'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 상품 선택 (결제 유형에 따라) */}
            {formData.payment_type === 'membership' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회원권 종류 *
                </label>
                <select
                  value={formData.membership_type_id || ''}
                  onChange={e =>
                    handleInputChange('membership_type_id', parseInt(e.target.value) || null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.membershipTypes}
                  required
                >
                  <option value="">
                    {loading.membershipTypes ? '회원권 목록 로딩 중...' : '회원권을 선택하세요'}
                  </option>
                  {membershipTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.duration_months}개월) - {formatCurrency(type.price)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.payment_type === 'pt' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PT 패키지 *</label>
                <select
                  value={formData.pt_package_id || ''}
                  onChange={e =>
                    handleInputChange('pt_package_id', parseInt(e.target.value) || null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.ptPackages}
                  required
                >
                  <option value="">
                    {loading.ptPackages ? 'PT 패키지 목록 로딩 중...' : 'PT 패키지를 선택하세요'}
                  </option>
                  {ptPackages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.session_count}회) - {formatCurrency(pkg.price)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 결제 금액 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calculator className="w-4 h-4 inline mr-1" />
                결제 금액 *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => handleInputChange('amount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="금액을 입력하세요"
                  min="0"
                  required
                />
                <div className="absolute right-3 top-2 text-gray-500">원</div>
              </div>
              {formData.amount > 0 && (
                <p className="mt-1 text-sm text-blue-600">{formatCurrency(formData.amount)}</p>
              )}
            </div>

            {/* 결제 방법 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">결제 방법 *</label>
              <select
                value={formData.payment_method}
                onChange={e => handleInputChange('payment_method', e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="현금">현금</option>
                <option value="카드">카드</option>
                <option value="계좌이체">계좌이체</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 결제 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">결제 날짜 *</label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={e => handleInputChange('payment_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
              <textarea
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="추가 메모가 있으면 입력하세요"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : payment ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
