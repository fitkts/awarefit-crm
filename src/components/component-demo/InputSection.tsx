import { Calendar, Edit, Mail, Phone } from '@/utils/lucide-shim';
import React, { useState } from 'react';
import { Button, Card, Input, Select, Textarea, type InputSize } from '../../components/ui';

const InputSection: React.FC = () => {
  const [inputSize, setInputSize] = useState<InputSize>('md');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [inputSuccess, setInputSuccess] = useState('');
  const inputSizes: InputSize[] = ['sm', 'md', 'lg'];

  return (
    <section id="inputs">
      <Card
        title="Input 컴포넌트"
        subtitle="폼 입력을 위한 다양한 인풋 컴포넌트들입니다"
        icon={Edit}
        variant="elevated"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">기본 Input</h4>
            <Input
              label="이름"
              placeholder="이름을 입력하세요"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              size={inputSize}
              error={inputError}
              success={inputSuccess}
              required
            />
            <Input
              label="이메일"
              type="email"
              placeholder="이메일을 입력하세요"
              icon={Mail}
              hint="유효한 이메일 주소를 입력해주세요"
            />
            <Input label="전화번호" placeholder="010-0000-0000" icon={Phone} iconPosition="left" />
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setInputError('필수 필드입니다');
                  setInputSuccess('');
                }}
              >
                오류 표시
              </Button>
              <Button
                size="sm"
                variant="success"
                onClick={() => {
                  setInputSuccess('올바른 형식입니다');
                  setInputError('');
                }}
              >
                성공 표시
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setInputError('');
                  setInputSuccess('');
                }}
              >
                초기화
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">기타 Input 타입</h4>
            <Select
              label="카테고리"
              placeholder="카테고리를 선택하세요"
              options={[
                { value: 'general', label: '일반' },
                { value: 'support', label: '지원' },
                { value: 'bug', label: '버그 신고' },
                { value: 'feature', label: '기능 요청' },
              ]}
            />
            <Input label="날짜" type="date" icon={Calendar} />
            <Textarea
              label="메시지"
              placeholder="메시지를 입력하세요"
              rows={4}
              hint="최대 500자까지 입력 가능합니다"
            />
            <div className="grid grid-cols-3 gap-2">
              {inputSizes.map(size => (
                <Button
                  key={size}
                  size="sm"
                  variant={inputSize === size ? 'primary' : 'outline'}
                  onClick={() => setInputSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default InputSection;
