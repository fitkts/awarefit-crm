import { Copy, Palette, Settings, Star } from '@/utils/lucide-shim';
import React, { useState } from 'react';
import { Button, Card, Select, type CardVariant } from '../../components/ui';

const CardSection: React.FC = () => {
  const [cardVariant, setCardVariant] = useState<CardVariant>('default');
  const [cardHoverable, setCardHoverable] = useState(false);
  const [cardPadding, setCardPadding] = useState(true);

  const cardVariants: CardVariant[] = ['default', 'bordered', 'elevated', 'gradient'];

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const generateCardCode = () => {
    const props: string[] = [];
    if (cardVariant !== 'default') props.push(`variant="${cardVariant}"`);
    if (cardHoverable) props.push('hoverable');
    if (!cardPadding) props.push('padding={false}');
    const propsString = props.length > 0 ? ` ${props.join(' ')}` : '';
    return `<Card${propsString} title="카드 제목" subtitle="부제목" icon={Star}>\n  카드 내용\n</Card>`;
  };

  return (
    <section id="cards">
      <Card title="Card 컴포넌트" subtitle="정보를 구조화하여 표시하는 카드 컴포넌트입니다" icon={Palette} variant="elevated">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-dark-100">설정</h4>
            <Select label="Variant" value={cardVariant} onChange={e => setCardVariant(e.target.value as CardVariant)} options={cardVariants.map(v => ({ value: v, label: v }))} />
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={cardHoverable} onChange={e => setCardHoverable(e.target.checked)} className="rounded" />
                <span className="text-sm">Hoverable</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={cardPadding} onChange={e => setCardPadding(e.target.checked)} className="rounded" />
                <span className="text-sm">Padding</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-dark-100">미리보기</h4>
            <Card variant={cardVariant} title="카드 제목" subtitle="카드의 부제목입니다" icon={Star} hoverable={cardHoverable} padding={cardPadding} headerActions={<Button size="sm" variant="ghost" icon={Settings} />} footer={<div className="flex justify-between items-center"><span className="text-sm text-gray-500">Footer 영역</span><Button size="sm">액션</Button></div>}>
              <p className="text-gray-600">여기는 카드의 본문 내용이 들어가는 영역입니다. 다양한 콘텐츠를 배치할 수 있습니다.</p>
            </Card>
            <div className="bg-gray-900 dark:bg-dark-900 text-white p-4 rounded-lg text-sm font-mono relative">
              <button onClick={() => copyToClipboard(generateCardCode())} className="absolute top-2 right-2 p-1 hover:bg-gray-700 dark:hover:bg-dark-700 rounded">
                <Copy className="w-4 h-4" />
              </button>
              <pre>{generateCardCode()}</pre>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default CardSection;


