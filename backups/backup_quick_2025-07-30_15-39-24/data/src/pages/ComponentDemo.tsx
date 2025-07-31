import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Code,
  Copy,
  Edit,
  Eye,
  Heart,
  Info,
  Mail,
  Palette,
  Phone,
  Save,
  Settings,
  Star,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
  type ButtonSize,
  type ButtonVariant,
  type CardVariant,
  type InputSize,
  type ModalSize,
} from '../components/ui';

const ComponentDemo: React.FC = () => {
  const { addToast } = useToast();

  // Button Demo States
  const [buttonVariant, setButtonVariant] = useState<ButtonVariant>('primary');
  const [buttonSize, setButtonSize] = useState<ButtonSize>('md');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonFullWidth, setButtonFullWidth] = useState(false);

  // Card Demo States
  const [cardVariant, setCardVariant] = useState<CardVariant>('default');
  const [cardHoverable, setCardHoverable] = useState(false);
  const [cardPadding, setCardPadding] = useState(true);

  // Modal Demo States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<ModalSize>('md');

  // Input Demo States
  const [inputSize, setInputSize] = useState<InputSize>('md');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [inputSuccess, setInputSuccess] = useState('');

  // Form Demo States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: '',
  });

  const buttonVariants: ButtonVariant[] = [
    'primary',
    'secondary',
    'danger',
    'success',
    'warning',
    'ghost',
    'outline',
  ];
  const buttonSizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const cardVariants: CardVariant[] = ['default', 'bordered', 'elevated', 'gradient'];
  const modalSizes: ModalSize[] = ['sm', 'md', 'lg', 'xl'];
  const inputSizes: InputSize[] = ['sm', 'md', 'lg'];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      type: 'success',
      title: '코드 복사됨',
      message: '클립보드에 복사되었습니다.',
    });
  };

  const generateButtonCode = () => {
    const props = [];
    if (buttonVariant !== 'primary') props.push(`variant="${buttonVariant}"`);
    if (buttonSize !== 'md') props.push(`size="${buttonSize}"`);
    if (buttonLoading) props.push('loading');
    if (buttonDisabled) props.push('disabled');
    if (buttonFullWidth) props.push('fullWidth');

    const propsString = props.length > 0 ? ` ${props.join(' ')}` : '';
    return `<Button${propsString} icon={Save}>\n  버튼 텍스트\n</Button>`;
  };

  const generateCardCode = () => {
    const props = [];
    if (cardVariant !== 'default') props.push(`variant="${cardVariant}"`);
    if (cardHoverable) props.push('hoverable');
    if (!cardPadding) props.push('padding={false}');

    const propsString = props.length > 0 ? ` ${props.join(' ')}` : '';
    return `<Card${propsString} title="카드 제목" subtitle="부제목" icon={Star}>\n  카드 내용\n</Card>`;
  };

  const demoSections = [
    {
      id: 'buttons',
      title: 'Button 컴포넌트',
      description: '다양한 스타일과 크기의 버튼 컴포넌트',
      icon: Zap,
    },
    {
      id: 'cards',
      title: 'Card 컴포넌트',
      description: '정보를 담는 카드형 레이아웃 컴포넌트',
      icon: Palette,
    },
    {
      id: 'modals',
      title: 'Modal 컴포넌트',
      description: '오버레이 형태의 모달 다이얼로그',
      icon: Eye,
    },
    {
      id: 'inputs',
      title: 'Input 컴포넌트',
      description: '폼 입력을 위한 다양한 인풋 컴포넌트',
      icon: Edit,
    },
    {
      id: 'toasts',
      title: 'Toast 알림',
      description: '사용자 피드백을 위한 토스트 알림',
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Code className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">컴포넌트 데모</h1>
            <p className="text-purple-100 mt-2">
              재사용 가능한 UI 컴포넌트들을 직접 테스트하고 코드를 확인해보세요
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          {demoSections.map(section => {
            const Icon = section.icon;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center space-x-3 p-3 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-200"
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{section.title}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Button 섹션 */}
      <section id="buttons">
        <Card
          title="Button 컴포넌트"
          subtitle="다양한 스타일과 크기의 버튼을 제공합니다"
          icon={Zap}
          variant="elevated"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 컨트롤 패널 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">설정</h4>

              <Select
                label="Variant"
                value={buttonVariant}
                onChange={e => setButtonVariant(e.target.value as ButtonVariant)}
                options={buttonVariants.map(v => ({ value: v, label: v }))}
              />

              <Select
                label="Size"
                value={buttonSize}
                onChange={e => setButtonSize(e.target.value as ButtonSize)}
                options={buttonSizes.map(s => ({ value: s, label: s }))}
              />

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={buttonLoading}
                    onChange={e => setButtonLoading(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Loading</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={buttonDisabled}
                    onChange={e => setButtonDisabled(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Disabled</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={buttonFullWidth}
                    onChange={e => setButtonFullWidth(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Full Width</span>
                </label>
              </div>
            </div>

            {/* 미리보기 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">미리보기</h4>

              <div className="p-6 bg-gray-50 rounded-lg">
                <Button
                  variant={buttonVariant}
                  size={buttonSize}
                  loading={buttonLoading}
                  disabled={buttonDisabled}
                  fullWidth={buttonFullWidth}
                  icon={Save}
                  onClick={() => addToast({ type: 'info', title: '버튼 클릭됨!' })}
                >
                  버튼 텍스트
                </Button>
              </div>

              <div className="bg-gray-900 text-white p-4 rounded-lg text-sm font-mono relative">
                <button
                  onClick={() => copyToClipboard(generateButtonCode())}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <pre>{generateButtonCode()}</pre>
              </div>
            </div>
          </div>

          {/* 모든 버튼 variants 예시 */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">모든 Variants</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {buttonVariants.map(variant => (
                <Button
                  key={variant}
                  variant={variant}
                  size="sm"
                  onClick={() => addToast({ type: 'info', title: `${variant} 클릭됨!` })}
                >
                  {variant}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Card 섹션 */}
      <section id="cards">
        <Card
          title="Card 컴포넌트"
          subtitle="정보를 구조화하여 표시하는 카드 컴포넌트입니다"
          icon={Palette}
          variant="elevated"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 컨트롤 패널 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">설정</h4>

              <Select
                label="Variant"
                value={cardVariant}
                onChange={e => setCardVariant(e.target.value as CardVariant)}
                options={cardVariants.map(v => ({ value: v, label: v }))}
              />

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={cardHoverable}
                    onChange={e => setCardHoverable(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Hoverable</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={cardPadding}
                    onChange={e => setCardPadding(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Padding</span>
                </label>
              </div>
            </div>

            {/* 미리보기 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">미리보기</h4>

              <Card
                variant={cardVariant}
                title="카드 제목"
                subtitle="카드의 부제목입니다"
                icon={Star}
                hoverable={cardHoverable}
                padding={cardPadding}
                headerActions={<Button size="sm" variant="ghost" icon={Settings} />}
                footer={
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Footer 영역</span>
                    <Button size="sm">액션</Button>
                  </div>
                }
              >
                <p className="text-gray-600">
                  여기는 카드의 본문 내용이 들어가는 영역입니다. 다양한 콘텐츠를 배치할 수 있습니다.
                </p>
              </Card>

              <div className="bg-gray-900 text-white p-4 rounded-lg text-sm font-mono relative">
                <button
                  onClick={() => copyToClipboard(generateCardCode())}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <pre>{generateCardCode()}</pre>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Modal 섹션 */}
      <section id="modals">
        <Card
          title="Modal 컴포넌트"
          subtitle="오버레이 형태의 다이얼로그 컴포넌트입니다"
          icon={Eye}
          variant="elevated"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">설정</h4>

              <Select
                label="Size"
                value={modalSize}
                onChange={e => setModalSize(e.target.value as ModalSize)}
                options={modalSizes.map(s => ({ value: s, label: s }))}
              />

              <Button onClick={() => setModalOpen(true)}>모달 열기</Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">사용 예시</h4>
              <div className="bg-gray-900 text-white p-4 rounded-lg text-sm font-mono">
                <pre>{`<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="모달 제목"
  size="${modalSize}"
>
  모달 내용
</Modal>`}</pre>
              </div>
            </div>
          </div>
        </Card>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="데모 모달"
          size={modalSize}
          footerContent={
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                취소
              </Button>
              <Button onClick={() => setModalOpen(false)}>확인</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p>이것은 {modalSize} 크기의 모달 예시입니다.</p>
            <p>
              모달은 다양한 용도로 사용할 수 있으며, 사용자와의 상호작용을 위한 효과적인 방법입니다.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">모달 기능</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• ESC 키로 닫기</li>
                <li>• 배경 클릭으로 닫기</li>
                <li>• 다양한 크기 지원</li>
                <li>• 커스텀 헤더/푸터</li>
              </ul>
            </div>
          </div>
        </Modal>
      </section>

      {/* Input 섹션 */}
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

              <Input
                label="전화번호"
                placeholder="010-0000-0000"
                icon={Phone}
                iconPosition="left"
              />

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

      {/* Toast 섹션 */}
      <section id="toasts">
        <Card
          title="Toast 알림"
          subtitle="사용자 피드백을 위한 토스트 알림 시스템입니다"
          icon={Bell}
          variant="elevated"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="success"
              icon={CheckCircle}
              onClick={() =>
                addToast({
                  type: 'success',
                  title: '성공!',
                  message: '작업이 성공적으로 완료되었습니다.',
                })
              }
            >
              성공 알림
            </Button>

            <Button
              variant="danger"
              icon={XCircle}
              onClick={() =>
                addToast({
                  type: 'error',
                  title: '오류 발생',
                  message: '작업을 처리하는 중 오류가 발생했습니다.',
                })
              }
            >
              오류 알림
            </Button>

            <Button
              variant="warning"
              icon={AlertTriangle}
              onClick={() =>
                addToast({
                  type: 'warning',
                  title: '주의',
                  message: '이 작업은 되돌릴 수 없습니다.',
                })
              }
            >
              경고 알림
            </Button>

            <Button
              variant="outline"
              icon={Info}
              onClick={() =>
                addToast({
                  type: 'info',
                  title: '정보',
                  message: '새로운 업데이트가 있습니다.',
                })
              }
            >
              정보 알림
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Toast 사용법</h4>
            <div className="bg-gray-900 text-white p-3 rounded text-sm font-mono">
              <pre>{`const { addToast } = useToast();

addToast({
  type: 'success',
  title: '제목',
  message: '메시지',
  duration: 4000, // optional
  autoClose: true, // optional
});`}</pre>
            </div>
          </div>
        </Card>
      </section>

      {/* 실제 사용 예제 */}
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
                icon={Save}
                onClick={() => {
                  addToast({
                    type: 'success',
                    title: '폼 제출 완료',
                    message: '문의가 성공적으로 접수되었습니다.',
                  });
                }}
              >
                제출하기
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    category: '',
                    message: '',
                  });
                  addToast({
                    type: 'info',
                    title: '폼 초기화',
                    message: '모든 필드가 초기화되었습니다.',
                  });
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
                  <span
                    key={comp}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"
                  >
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
    </div>
  );
};

export default ComponentDemo;
