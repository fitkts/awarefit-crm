import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberForm from '../../components/member/MemberForm';

describe('MemberForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('폼 렌더링 테스트', () => {
    render(<MemberForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/전화번호/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
  });

  test('폼 제출 테스트', async () => {
    render(<MemberForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/이름/i), {
      target: { value: '홍길동' },
    });

    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  test('필수 필드 유효성 검사', async () => {
    render(<MemberForm onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /저장/i }));

    await waitFor(() => {
      expect(screen.getByText(/이름을 입력해주세요/i)).toBeInTheDocument();
    });
  });
});
