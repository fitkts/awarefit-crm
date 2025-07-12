import {
    Save,
    User,
    UserCheck
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Member } from '../../types/member';
import { FormConfig, PersonalInfo, Staff } from '../../types/staff';
import { isValidBirthDate, isValidEmail, isValidPhone } from '../../utils/memberUtils';

interface PersonFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  config: FormConfig;
  person?: Member | Staff; // 수정 모드일 때 전달되는 기존 데이터
  isLoading?: boolean;
}

const PersonForm: React.FC<PersonFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  config,
  person,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PersonalInfo & Record<string, any>>({
    name: '',
    phone: '',
    email: '',
    gender: undefined,
    birth_date: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = !!person;

  // 폼 초기화
  useEffect(() => {
    if (person) {
      const commonFields = {
        name: person.name,
        phone: person.phone || '',
        email: person.email || '',
        gender: person.gender || undefined,
        birth_date: person.birth_date || '',
        address: person.address || '',
        notes: person.notes || '',
      };

      // 직원일 경우 추가 필드
      if (config.entityType === 'staff' && 'position' in person) {
        setFormData({
          ...commonFields,
          position: person.position || '',
          department: (person as Staff).department || '',
          salary: (person as Staff).salary || '',
        });
      } else {
        setFormData(commonFields);
      }
    } else {
      // 새 등록 모드일 때 폼 초기화
      const initialData: PersonalInfo & Record<string, any> = {
        name: '',
        phone: '',
        email: '',
        gender: undefined,
        birth_date: '',
        address: '',
        notes: '',
      };

      if (config.entityType === 'staff') {
        initialData.position = '';
        initialData.department = '';
        initialData.salary = '';
      }

      setFormData(initialData);
    }
    setErrors({});
  }, [person, isOpen, config.entityType]);

  // 모달 외부 클릭 핸들러
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

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

  // 휴대폰 번호 포맷팅 함수
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 입력값 변경 핸들러
  const handleInputChange = (field: string, value: string | number) => {
    let processedValue = value;

    // 휴대폰 번호 자동 포맷팅
    if (field === 'phone') {
      processedValue = formatPhoneNumber(String(value));
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));

    // 실시간 유효성 검사
    const fieldError = validateField(field, processedValue);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  // 개별 필드 유효성 검사
  const validateField = (field: string, value: string | number): string => {
    switch (field) {
      case 'name':
        if (!String(value).trim()) return '이름은 필수입니다.';
        if (String(value).length < 2) return '이름은 2자 이상 입력해주세요.';
        break;
      case 'phone':
        if (value && !isValidPhone(String(value))) {
          return '올바른 휴대폰 번호를 입력해주세요.';
        }
        break;
      case 'email':
        if (value && !isValidEmail(String(value))) {
          return '올바른 이메일 주소를 입력해주세요.';
        }
        break;
      case 'birth_date':
        if (value && !isValidBirthDate(String(value))) {
          return '올바른 생년월일을 입력해주세요.';
        }
        break;
      case 'position':
        if (config.entityType === 'staff' && !String(value).trim()) {
          return '직책은 필수입니다.';
        }
        break;
      case 'salary':
        if (value && Number(value) < 0) {
          return '급여는 0 이상이어야 합니다.';
        }
        break;
    }
    return '';
  };

  // 폼 전체 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 필수 필드 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다.';
    } else if (formData.name.length < 2) {
      newErrors.name = '이름은 2자 이상 입력해주세요.';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = '올바른 휴대폰 번호를 입력해주세요.';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = '올바른 이메일 주소를 입력해주세요.';
    }

    if (formData.birth_date && !isValidBirthDate(formData.birth_date)) {
      newErrors.birth_date = '올바른 생년월일을 입력해주세요.';
    }

    // 직원 전용 필드 검증
    if (config.entityType === 'staff') {
      if (!formData.position?.trim()) {
        newErrors.position = '직책은 필수입니다.';
      }
      if (formData.salary && Number(formData.salary) < 0) {
        newErrors.salary = '급여는 0 이상이어야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && person) {
        const updateData = { ...formData, id: person.id };
        await onSubmit(updateData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error('저장 실패:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {config.entityType === 'member' ? (
              <User className="w-5 h-5 text-blue-600" />
            ) : (
              <UserCheck className="w-5 h-5 text-green-600" />
            )}
            <h2 className="text-lg font-bold text-gray-900">
              {config.title}
            </h2>
          </div>
        </div>

        {/* 폼 */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* 기본 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">기본 정보</h3>
              
              {/* 이름 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="이름을 입력하세요"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              {/* 성별과 생년월일 - 한 줄 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">성별</label>
                  <select
                    value={formData.gender || ''}
                    onChange={e => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isLoading}
                  >
                    <option value="">선택</option>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">생년월일</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={e => handleInputChange('birth_date', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.birth_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 직원 전용: 직책과 부서 */}
              {config.entityType === 'staff' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      직책 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.position || ''}
                      onChange={e => handleInputChange('position', e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.position ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="트레이너, 관리자"
                      disabled={isLoading}
                    />
                    {errors.position && (
                      <p className="mt-1 text-xs text-red-600">{errors.position}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">부서</label>
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={e => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="헬스팀"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* 직원 전용: 급여 */}
              {config.entityType === 'staff' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">월급여</label>
                  <input
                    type="number"
                    value={formData.salary || ''}
                    onChange={e => handleInputChange('salary', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.salary ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            {/* 연락처 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">연락처</h3>
              
              {/* 휴대폰 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">휴대폰</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="010-0000-0000"
                  maxLength={13}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">이메일</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">주소</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="주소를 입력하세요"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 메모 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">메모</h3>
              <textarea
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                placeholder="추가 정보나 특이사항"
                disabled={isLoading}
              />
            </div>
          </form>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:bg-blue-400"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? '저장 중...' : config.submitButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonForm; 