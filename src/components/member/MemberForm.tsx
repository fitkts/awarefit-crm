import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, MapPin, AlertCircle, Save, X } from 'lucide-react';
import { CreateMemberInput, UpdateMemberInput, Member } from '../../types/member';
import { isValidEmail, isValidPhone, isValidBirthDate } from '../../utils/memberUtils';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMemberInput | UpdateMemberInput) => Promise<void>;
  member?: Member; // 수정 모드일 때 전달되는 기존 회원 데이터
  isLoading?: boolean;
}

const MemberForm: React.FC<MemberFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  member,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateMemberInput>({
    name: '',
    phone: '',
    email: '',
    gender: undefined,
    birth_date: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditMode = !!member;

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        phone: member.phone || '',
        email: member.email || '',
        gender: member.gender || undefined,
        birth_date: member.birth_date || '',
        address: member.address || '',
        emergency_contact: member.emergency_contact || '',
        emergency_phone: member.emergency_phone || '',
        notes: member.notes || '',
      });
    } else {
      // 새 회원 등록 모드일 때 폼 초기화
      setFormData({
        name: '',
        phone: '',
        email: '',
        gender: undefined,
        birth_date: '',
        address: '',
        emergency_contact: '',
        emergency_phone: '',
        notes: '',
      });
    }
    setErrors({});
  }, [member, isOpen]);

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof CreateMemberInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 실시간 유효성 검사
    const fieldError = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  // 개별 필드 유효성 검사
  const validateField = (field: keyof CreateMemberInput, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return '이름은 필수입니다.';
        if (value.length < 2) return '이름은 2자 이상 입력해주세요.';
        break;
      case 'phone':
        if (value && !isValidPhone(value)) {
          return '올바른 휴대폰 번호를 입력해주세요.';
        }
        break;
      case 'email':
        if (value && !isValidEmail(value)) {
          return '올바른 이메일 주소를 입력해주세요.';
        }
        break;
      case 'birth_date':
        if (value && !isValidBirthDate(value)) {
          return '올바른 생년월일을 입력해주세요.';
        }
        break;
    }
    return '';
  };

  // 폼 전체 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
      if (isEditMode && member) {
        const updateData: UpdateMemberInput = { ...formData, id: member.id };
        await onSubmit(updateData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error('회원 정보 저장 실패:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? '회원 정보 수정' : '새 회원 등록'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="회원 이름"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
              <select
                value={formData.gender || ''}
                onChange={e => handleInputChange('gender', e.target.value as '남성' | '여성')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="">선택하세요</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 휴대폰 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                휴대폰
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="010-0000-0000"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="example@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              생년월일
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={e => handleInputChange('birth_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.birth_date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.birth_date && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.birth_date}
              </p>
            )}
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              주소
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={e => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="주소를 입력하세요"
              disabled={isLoading}
            />
          </div>

          {/* 비상연락처 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비상연락처 이름
              </label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={e => handleInputChange('emergency_contact', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="비상연락처 이름"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비상연락처 전화번호
              </label>
              <input
                type="tel"
                value={formData.emergency_phone}
                onChange={e => handleInputChange('emergency_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="010-0000-0000"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
            <textarea
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="추가 정보나 특이사항을 입력하세요"
              disabled={isLoading}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:bg-blue-400"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? '저장 중...' : isEditMode ? '수정' : '등록'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
