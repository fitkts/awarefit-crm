import { Copy, Save, Zap } from '@/utils/lucide-shim';
import React, { useState } from 'react';
import { Button, Card, Select, useToast, type ButtonSize, type ButtonVariant } from '../../components/ui';

const ButtonSection: React.FC = () => {
  const { addToast } = useToast();

  const [buttonVariant, setButtonVariant] = useState<ButtonVariant>('primary');
  const [buttonSize, setButtonSize] = useState<ButtonSize>('md');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [buttonFullWidth, setButtonFullWidth] = useState(false);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ type: 'success', title: '코드 복사됨', message: '클립보드에 복사되었습니다.' });
  };

  const generateButtonCode = () => {
    const props: string[] = [];
    if (buttonVariant !== 'primary') props.push(`variant="${buttonVariant}"`);
    if (buttonSize !== 'md') props.push(`size="${buttonSize}"`);
    if (buttonLoading) props.push('loading');
    if (buttonDisabled) props.push('disabled');
    if (buttonFullWidth) props.push('fullWidth');
    const propsString = props.length > 0 ? ` ${props.join(' ')}` : '';
    return `<Button${propsString} icon={Save}>\n  버튼 텍스트\n</Button>`;
  };

  return (
    <section id="buttons">
      <Card title="Button 컴포넌트" subtitle="다양한 스타일과 크기의 버튼을 제공합니다" icon={Zap} variant="elevated">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-dark-100">설정</h4>
            <Select label="Variant" value={buttonVariant} onChange={e => setButtonVariant(e.target.value as ButtonVariant)} options={buttonVariants.map(v => ({ value: v, label: v }))} />
            <Select label="Size" value={buttonSize} onChange={e => setButtonSize(e.target.value as ButtonSize)} options={buttonSizes.map(s => ({ value: s, label: s }))} />
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={buttonLoading} onChange={e => setButtonLoading(e.target.checked)} className="rounded" />
                <span className="text-sm">Loading</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={buttonDisabled} onChange={e => setButtonDisabled(e.target.checked)} className="rounded" />
                <span className="text-sm">Disabled</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={buttonFullWidth} onChange={e => setButtonFullWidth(e.target.checked)} className="rounded" />
                <span className="text-sm">Full Width</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-dark-100">미리보기</h4>
            <div className="p-6 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <Button variant={buttonVariant} size={buttonSize} loading={buttonLoading} disabled={buttonDisabled} fullWidth={buttonFullWidth} icon={Save} onClick={() => addToast({ type: 'info', title: '버튼 클릭됨!' })}>
                버튼 텍스트
              </Button>
            </div>
            <div className="bg-gray-900 dark:bg-dark-900 text-white p-4 rounded-lg text-sm font-mono relative">
              <button onClick={() => copyToClipboard(generateButtonCode())} className="absolute top-2 right-2 p-1 hover:bg-gray-700 dark:hover:bg-dark-700 rounded">
                <Copy className="w-4 h-4" />
              </button>
              <pre>{generateButtonCode()}</pre>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-600">
          <h4 className="font-semibold text-gray-900 dark:text-dark-100 mb-4">모든 Variants</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {buttonVariants.map(variant => (
              <Button key={variant} variant={variant} size="sm" onClick={() => addToast({ type: 'info', title: `${variant} 클릭됨!` })}>
                {variant}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};

export default ButtonSection;


