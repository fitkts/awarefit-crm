import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentForm from '../../components/payment/PaymentForm';

describe('PaymentForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('결제 폼 렌더링 테스트', () => {
    render(<PaymentForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/결제 금액/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/결제 방법/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/결제 날짜/i)).toBeInTheDocument();
  });

  test('금액 유효성 검사', async () => {
    render(<PaymentForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/결제 금액/i), {
      target: { value: '-1000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(screen.getByText(/올바른 금액을 입력해주세요/i)).toBeInTheDocument();
    });
  });
});
