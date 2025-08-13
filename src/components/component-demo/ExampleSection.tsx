import { Copy, Heart, Mail, Phone, Settings, User } from '@/utils/lucide-shim';
import React, { useState } from 'react';
import { Button, Card, Input, Select, Textarea, useToast } from '../../components/ui';

const ExampleSection: React.FC = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: '',
  });

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  return (
    <Card
      title="실제 사용 예제"
      subtitle="컴포넌트들을 조합한 실제 폼 예제입니다"
      icon={Settings}
      variant="gradient"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Input
            label="이름"
            placeholder="이름을 입력하세요"
            icon={User}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="이메일"
            type="email"
            placeholder="이메일을 입력하세요"
            icon={Mail}
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="전화번호"
            placeholder="010-0000-0000"
            icon={Phone}
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />

          <Select
            label="문의 카테고리"
            placeholder="카테고리를 선택하세요"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: 'general', label: '일반 문의' },
              { value: 'support', label: '기술 지원' },
              { value: 'bug', label: '버그 신고' },
              { value: 'feature', label: '기능 요청' },
            ]}
            required
          />

          <Textarea
            label="메시지"
            placeholder="문의 내용을 입력하세요"
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            hint="최대 500자까지 입력 가능합니다"
            required
          />

          <div className="flex space-x-3">
            <Button
              variant="primary"
              onClick={() => {
                addToast({ type: 'success', title: '폼 제출 완료', message: '문의가 성공적으로 접수되었습니다.' });
              }}
            >
              제출하기
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFormData({ name: '', email: '', phone: '', category: '', message: '' });
                addToast({ type: 'info', title: '폼 초기화', message: '모든 필드가 초기화되었습니다.' });
              }}
            >
              초기화
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              개발 팁
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 컴포넌트를 조합하여 복잡한 UI를 구성하세요</li>
              <li>• props를 통해 다양한 스타일을 적용할 수 있습니다</li>
              <li>• TypeScript로 타입 안정성을 보장합니다</li>
              <li>• 접근성 가이드라인을 준수합니다</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">사용 중인 컴포넌트</h4>
            <div className="flex flex-wrap gap-2">
              {['Input', 'Select', 'Textarea', 'Button', 'Card'].map(comp => (
                <span key={comp} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {comp}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 text-white p-4 rounded-lg text-sm font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Import 구문</span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `import { Button, Card, Input, Select, Textarea, useToast } from '../components/ui';`
                  )
                }
                className="p-1 hover:bg-gray-700 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <pre>{`import { 
  Button, 
  Card, 
  Input, 
  Select, 
  Textarea, 
  useToast 
} from '../components/ui';`}</pre>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExampleSection;


