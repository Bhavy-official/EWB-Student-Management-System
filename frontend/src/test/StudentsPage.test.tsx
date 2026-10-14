import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StudentsPage } from '../pages/StudentsPage';
import { studentApi } from '../services/api';

vi.mock('../services/api', () => ({
  studentApi: {
    getStudents: vi.fn(),
    deleteStudent: vi.fn(),
  },
  getApiErrorMessage: (err: any) => 'Mock error',
}));

describe('StudentsPage', () => {
  it('renders student list and pagination elements', async () => {
    (studentApi.getStudents as any).mockResolvedValue({
      items: [
        {
          id: 101,
          full_name: 'Jane Doe',
          email: 'jane@example.com',
          course: 'Data Science',
          date_of_birth: '2002-05-10',
          age: 24,
          phone_number: '9876543210',
          enrollment_date: '2025-08-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      page_size: 10,
      total_pages: 1,
    });

    render(
      <BrowserRouter>
        <StudentsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Student Directory')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getAllByText('jane@example.com').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Data Science').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders empty state when no students match', async () => {
    (studentApi.getStudents as any).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 1,
    });

    render(
      <BrowserRouter>
        <StudentsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No students match criteria')).toBeInTheDocument();
    });
  });
});
