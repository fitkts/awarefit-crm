import { AlertTriangle, Bell, CheckCircle, Info, XCircle } from '@/utils/lucide-shim';
import React from 'react';
import { Button, Card, useToast } from '../../components/ui';

const ToastSection: React.FC = () => {
  const { addToast } = useToast();

  return (
    <section id="toasts">
      <Card title="Toast 알림" subtitle="사용자 피드백을 위한 토스트 알림 시스템입니다" icon={Bell} variant="elevated">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="success" icon={CheckCircle} onClick={() => addToast({ type: 'success', title: '성공!', message: '작업이 성공적으로 완료되었습니다.' })}>성공 알림</Button>
          <Button variant="danger" icon={XCircle} onClick={() => addToast({ type: 'error', title: '오류 발생', message: '작업을 처리하는 중 오류가 발생했습니다.' })}>오류 알림</Button>
          <Button variant="warning" icon={AlertTriangle} onClick={() => addToast({ type: 'warning', title: '주의', message: '이 작업은 되돌릴 수 없습니다.' })}>경고 알림</Button>
          <Button variant="outline" icon={Info} onClick={() => addToast({ type: 'info', title: '정보', message: '새로운 업데이트가 있습니다.' })}>정보 알림</Button>
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
  );
};

export default ToastSection;


