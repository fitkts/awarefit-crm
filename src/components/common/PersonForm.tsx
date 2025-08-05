import { Save, User, UserCheck } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Member } from '../../types/member';
import { FormConfig, Staff } from '../../types/staff';
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
  // 상태 관리
  const [formData, setFormData] = useState<Record<string, any>>({
    name: '',
    phone: '',
    email: '',
    gender: undefined,
    birth_date: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 편집 모드 여부
  const isEditMode = !!person;

  // 폼 초기화
  useEffect(() => {
    if (person) {
      const commonFields: Record<string, any> = {
        name: person.name,
        phone: person.phone || '',
        email: person.email || '',
        gender: person.gender || undefined,
        birth_date: person.birth_date || '',
        join_date: (person as any).join_date || '', // 회원의 경우 가입일
        address: person.address || '',
        notes: person.notes || '',
      };

      // 직원일 경우 추가 필드
      if (config.entityType === 'staff' && 'position' in person) {
        const staffPerson = person as Staff;
        const staffFields: Record<string, any> = {
          ...commonFields,
          position: staffPerson.position || '',
          department: staffPerson.department || '',
          salary: staffPerson.salary || '',
          hire_date: staffPerson.hire_date || '',
          role_id: staffPerson.role_id || '',
          can_manage_payments: staffPerson.can_manage_payments || false,
          can_manage_members: staffPerson.can_manage_members || false,
        };

        // config.additionalFields에서 정의된 필드들도 추가로 처리
        if (config.additionalFields) {
          config.additionalFields.forEach(field => {
            if (field.key in staffPerson) {
              let value = (staffPerson as any)[field.key];

              // boolean 값을 select용 문자열로 변환
              if (field.type === 'select' && typeof value === 'boolean') {
                value = value.toString();
              }

              staffFields[field.key] = value || '';
            }
          });
        }

        setFormData(staffFields as Record<string, any>);
      } else {
        // 회원일 경우 추가 필드 처리
        const memberFields: Record<string, any> = { ...commonFields };

        if (config.additionalFields) {
          config.additionalFields.forEach(field => {
            if (field.key in person) {
              let value = (person as any)[field.key];

              // boolean 값을 select용 문자열로 변환
              if (field.type === 'select' && typeof value === 'boolean') {
                value = value.toString();
              }

              memberFields[field.key] = value || '';
            }
          });
        }

        setFormData(memberFields as Record<string, any>);
      }
    } else {
      // 새 등록 모드일 때 폼 초기화
      const initialData: Record<string, any> = {
        name: '',
        phone: '',
        email: '',
        gender: undefined,
        birth_date: '',
        join_date: config.entityType === 'member' ? new Date().toISOString().split('T')[0] : '', // 회원의 경우 오늘 날짜로 기본 설정
        address: '',
        notes: '',
      };

      if (config.entityType === 'staff') {
        initialData.position = '';
        initialData.department = '';
        initialData.salary = '';
        initialData.hire_date = new Date().toISOString().split('T')[0]; // 입사일 기본값
      }

      // config.additionalFields에서 정의된 필드들의 기본값 설정
      if (config.additionalFields) {
        config.additionalFields.forEach(field => {
          if (field.type === 'select' && field.options && field.options.length > 0) {
            initialData[field.key] = field.options[0].value;
          } else {
            initialData[field.key] = '';
          }
        });
      }

      setFormData(initialData);
    }
    setErrors({});
  }, [person, isOpen, config.entityType, config.additionalFields]);

  // 모달 외부 클릭 핸들러
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

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

    // 추가 필드 검증
    if (config.additionalFields) {
      config.additionalFields.forEach(field => {
        if (field.required && !formData[field.key]) {
          newErrors[field.key] = `${field.label}은(는) 필수입니다.`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔍 [PersonForm] 폼 제출 시작');
    console.log('🔍 [PersonForm] formData:', formData);
    console.log('🔍 [PersonForm] assigned_staff_id 값:', formData.assigned_staff_id);

    if (!validateForm()) {
      console.log('🔍 [PersonForm] 유효성 검사 실패');
      return;
    }

    try {
      console.log('🔍 [PersonForm] onSubmit 호출 직전의 formData:', formData);
      if (isEditMode && person) {
        const updateData = { ...formData, id: person.id };
        console.log('🔍 [PersonForm] 수정 모드 - updateData:', updateData);
        await onSubmit(updateData);
      } else {
        console.log('🔍 [PersonForm] 생성 모드 - formData:', formData);
        await onSubmit(formData);
      }
      console.log('🔍 [PersonForm] onSubmit 완료');
      onClose();
    } catch (error) {
      console.error('🚨 [PersonForm] 폼 제출 실패:', error);
      // 에러는 상위 컴포넌트에서 처리
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-md w-full max-h-[85vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-dark-600 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center space-x-2">
            {config.entityType === 'member' ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <UserCheck className="w-4 h-4 text-white" />
            )}
            <h2 className="text-base font-bold text-white">{config.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            disabled={isLoading}
          >
            <span className="sr-only">닫기</span>✕
          </button>
        </div>

        {/* 폼 */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          <form onSubmit={handleSubmit} className="p-3 space-y-3">
            {/* 기본 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-dark-300">기본 정보</h3>

              {/* 이름 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-dark-700 dark:text-dark-100 ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-dark-600'
                  }`}
                  placeholder="이름을 입력하세요"
                  disabled={isLoading}
                />
                {errors.name && <p className="mt-0.5 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* 성별과 생년월일 - 한 줄 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">성별</label>
                  <select
                    value={formData.gender || ''}
                    onChange={e => handleInputChange('gender', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 dark:text-dark-100 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isLoading}
                  >
                    <option value="">선택</option>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">생년월일</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={e => handleInputChange('birth_date', e.target.value)}
                    className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-dark-700 dark:text-dark-100 ${
                      errors.birth_date ? 'border-red-500' : 'border-gray-300 dark:border-dark-600'
                    }`}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 회원 전용: 가입일 */}
              {config.entityType === 'member' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">가입일</label>
                  <input
                    type="date"
                    value={formData.join_date || new Date().toISOString().split('T')[0]}
                    onChange={e => handleInputChange('join_date', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 dark:text-dark-100 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* 직원 전용: 직책과 부서 */}
              {config.entityType === 'staff' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">
                      직책 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.position || ''}
                      onChange={e => handleInputChange('position', e.target.value)}
                      className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-dark-700 dark:text-dark-100 ${
                        errors.position ? 'border-red-500' : 'border-gray-300 dark:border-dark-600'
                      }`}
                      placeholder="트레이너, 관리자"
                      disabled={isLoading}
                    />
                    {errors.position && (
                      <p className="mt-0.5 text-xs text-red-600">{errors.position}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">부서</label>
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={e => handleInputChange('department', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 dark:text-dark-100 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="헬스팀"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* 직원 전용: 급여 */}
              {config.entityType === 'staff' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">월급여</label>
                  <input
                    type="number"
                    value={formData.salary || ''}
                    onChange={e => handleInputChange('salary', e.target.value)}
                    className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">연락처</h3>

              {/* 휴대폰과 이메일 - 한 줄 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">휴대폰</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="010-0000-0000"
                    maxLength={13}
                    disabled={isLoading}
                  />
                  {errors.phone && <p className="mt-0.5 text-xs text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">이메일</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="example@email.com"
                    disabled={isLoading}
                  />
                  {errors.email && <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">주소</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="주소를 입력하세요"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 메모 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">메모</h3>
              <textarea
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                placeholder="추가 정보나 특이사항"
                disabled={isLoading}
              />
            </div>

            {/* 추가 필드들 */}
            {config.additionalFields && config.additionalFields.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">추가 정보</h3>

                {config.additionalFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-gray-600 dark:text-dark-400 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500"> *</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={formData[field.key] || ''}
                        onChange={e => handleInputChange(field.key, e.target.value)}
                        className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors[field.key] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isLoading}
                      >
                        {field.options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.key] || ''}
                        onChange={e => handleInputChange(field.key, e.target.value)}
                        rows={2}
                        className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors ${
                          errors[field.key] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={field.placeholder}
                        disabled={isLoading}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={formData[field.key] || ''}
                        onChange={e => handleInputChange(field.key, e.target.value)}
                        className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors[field.key] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={field.placeholder}
                        disabled={isLoading}
                      />
                    )}

                    {errors[field.key] && (
                      <p className="mt-0.5 text-xs text-red-600">{errors[field.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-2 p-3 border-t border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-800 rounded hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:bg-blue-400"
          >
            <Save className="w-3 h-3" />
            <span>{isLoading ? '저장 중...' : config.submitButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export { PersonForm };
