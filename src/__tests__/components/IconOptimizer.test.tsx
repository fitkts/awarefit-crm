import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Icon, { OptimizedIcon } from '../../components/ui/IconOptimizer';

describe('IconOptimizer', () => {
  test('preloaded icon renders as SVG', () => {
    render(<OptimizedIcon name="Calendar" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    // lucide 아이콘은 svg 요소이므로, role이나 tagName으로 확인
    expect(icon.querySelector('svg')).toBeInTheDocument();
  });

  test('unknown icon renders placeholder div', () => {
    render(<OptimizedIcon name="UnknownIcon" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    // 미등록 아이콘은 div placeholder
    expect(icon.tagName.toLowerCase()).toBe('div');
  });

  test('direct wrapper renders without crash', () => {
    render(<Icon.Calendar data-testid="icon-calendar" />);
    expect(screen.getByTestId('icon-calendar')).toBeInTheDocument();
  });
});


