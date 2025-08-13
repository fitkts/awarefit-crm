import { Eye } from '@/utils/lucide-shim';
import React, { useState } from 'react';
import { Button, Card, Modal, Select, type ModalSize } from '../../components/ui';

const ModalSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<ModalSize>('md');
  const modalSizes: ModalSize[] = ['sm', 'md', 'lg', 'xl'];

  return (
    <section id="modals">
      <Card title="Modal 컴포넌트" subtitle="오버레이 형태의 다이얼로그 컴포넌트입니다" icon={Eye} variant="elevated">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-dark-100">설정</h4>
            <Select label="Size" value={modalSize} onChange={e => setModalSize(e.target.value as ModalSize)} options={modalSizes.map(s => ({ value: s, label: s }))} />
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="데모 모달" size={modalSize} footerContent={<div className="flex justify-end space-x-2"><Button variant="outline" onClick={() => setModalOpen(false)}>취소</Button><Button onClick={() => setModalOpen(false)}>확인</Button></div>}>
        <div className="space-y-4">
          <p>이것은 {modalSize} 크기의 모달 예시입니다.</p>
          <p>모달은 다양한 용도로 사용할 수 있으며, 사용자와의 상호작용을 위한 효과적인 방법입니다.</p>
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
  );
};

export default ModalSection;


