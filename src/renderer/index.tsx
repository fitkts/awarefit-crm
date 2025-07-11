import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Global polyfill (추가 보장)
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// React 18의 createRoot 사용
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

// 로딩 표시
container.innerHTML = `
  <div style="
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  ">
    <div style="
      width: 40px;
      height: 40px;
      border: 4px solid #e2e8f0;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    "></div>
    <p style="margin-top: 16px; color: #64748b;">Awarefit CRM 로딩 중...</p>
  </div>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`;

const root = createRoot(container);

// 에러 처리와 함께 앱 렌더링
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('앱 렌더링 오류:', error);
  container.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      color: #ef4444;
    ">
      <h2>앱 로딩 오류</h2>
      <p>개발자 도구를 확인해주세요.</p>
      <button onclick="location.reload()" style="
        margin-top: 16px;
        padding: 8px 16px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">다시 시도</button>
    </div>
  `;
}
