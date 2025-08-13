import { Bell, Code, Edit, Eye, Palette, Zap } from '@/utils/lucide-shim';
import React, { Suspense } from 'react';
import ThemeToggle from '../components/ui/ThemeToggle';

// 섹션 지연 로딩 (코드 스플리팅)
const ButtonSection = React.lazy(
  () => import(/* webpackChunkName: "demo-button-section" */ '../components/component-demo/ButtonSection')
);
const CardSection = React.lazy(
  () => import(/* webpackChunkName: "demo-card-section" */ '../components/component-demo/CardSection')
);
const ModalSection = React.lazy(
  () => import(/* webpackChunkName: "demo-modal-section" */ '../components/component-demo/ModalSection')
);
const InputSection = React.lazy(
  () => import(/* webpackChunkName: "demo-input-section" */ '../components/component-demo/InputSection')
);
const ToastSection = React.lazy(
  () => import(/* webpackChunkName: "demo-toast-section" */ '../components/component-demo/ToastSection')
);
const ExampleSection = React.lazy(
  () => import(/* webpackChunkName: "demo-example-section" */ '../components/component-demo/ExampleSection')
);

const ComponentDemo: React.FC = () => {
  const demoSections = [
    { id: 'buttons', title: 'Button 컴포넌트', icon: Zap },
    { id: 'cards', title: 'Card 컴포넌트', icon: Palette },
    { id: 'modals', title: 'Modal 컴포넌트', icon: Eye },
    { id: 'inputs', title: 'Input 컴포넌트', icon: Edit },
    { id: 'toasts', title: 'Toast 알림', icon: Bell },
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Code className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">컴포넌트 데모</h1>
            <p className="text-purple-100 mt-2">재사용 가능한 UI 컴포넌트들을 직접 테스트하고 코드를 확인해보세요</p>
          </div>
          <div className="flex items-start">
            <ThemeToggle size="lg" />
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
      <div id="buttons">
        <Suspense fallback={<div className="h-72 rounded-xl border bg-white/50 animate-pulse" />}>
          <ButtonSection />
        </Suspense>
          </div>

      {/* Card 섹션 */}
      <div id="cards">
        <Suspense fallback={<div className="h-72 rounded-xl border bg-white/50 animate-pulse" />}>
          <CardSection />
        </Suspense>
            </div>

      {/* Modal 섹션 */}
      <div id="modals">
        <Suspense fallback={<div className="h-72 rounded-xl border bg-white/50 animate-pulse" />}>
          <ModalSection />
        </Suspense>
            </div>

      {/* Input 섹션 */}
      <div id="inputs">
        <Suspense fallback={<div className="h-72 rounded-xl border bg-white/50 animate-pulse" />}>
          <InputSection />
        </Suspense>
            </div>

      {/* Toast 섹션 */}
      <div id="toasts">
        <Suspense fallback={<div className="h-48 rounded-xl border bg-white/50 animate-pulse" />}>
          <ToastSection />
        </Suspense>
          </div>

      {/* 예제 섹션 */}
      <Suspense fallback={<div className="h-72 rounded-xl border bg-white/50 animate-pulse" />}>
        <ExampleSection />
      </Suspense>
    </div>
  );
};

export default ComponentDemo;
