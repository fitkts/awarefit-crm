import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffForm from '../../components/staff/StaffForm';

describe('StaffForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('직원 폼 렌더링 테스트', () => {
    render(<StaffForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/직책/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/전화번호/i)).toBeInTheDocument();
  });

  test('직원 정보 저장 테스트', async () => {
    render(<StaffForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/이름/i), {
      target: { value: '김영희' },
    });

    fireEvent.change(screen.getByLabelText(/직책/i), {
      target: { value: '트레이너' },
    });

    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
