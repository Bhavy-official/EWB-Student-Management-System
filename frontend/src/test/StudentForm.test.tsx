import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StudentFormPage } from '../pages/StudentFormPage';
import { studentApi } from '../services/api';

vi.mock('../services/api', () => ({
  studentApi: {
    createStudent: vi.fn(),
    getStudentById: vi.fn(),
    updateStudent: vi.fn(),
  },
  getApiErrorMessage: (err: any) => 'Mock error',
}));

describe('StudentFormPage', () => {
  it('renders form inputs with initial defaults', () => {
    render(
      <BrowserRouter>
        <StudentFormPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Enroll New Student')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('aarav@example.com')).toBeInTheDocument();
  });

  it('validates client-side constraints on empty submit', async () => {
    render(
      <BrowserRouter>
        <StudentFormPage />
      </BrowserRouter>
    );

    const submitBtn = screen.getByText('Register Student');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Full name must be at least 2 characters')).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });
});
