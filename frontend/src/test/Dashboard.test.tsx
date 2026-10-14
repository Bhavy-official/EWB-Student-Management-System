import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { studentApi } from '../services/api';

vi.mock('../services/api', () => ({
  studentApi: {
    getStudentStats: vi.fn(),
  },
  getApiErrorMessage: (err: any) => 'Mock error',
}));

describe('DashboardPage', () => {
  it('renders stats and chart containers upon successful fetch', async () => {
    (studentApi.getStudentStats as any).mockResolvedValueOnce({
      total_students: 42,
      by_course: [
        { course: 'Computer Science', count: 20 },
        { course: 'Data Science', count: 22 },
      ],
      enrollment_trends: [{ period: '2025-08', count: 42 }],
      age_distribution: { '< 18': 2, '18 - 21': 25, '22 - 25': 12, '26+': 3 },
      recent_students: [
        {
          id: 1,
          full_name: 'Test Student',
          email: 'test@example.com',
          course: 'Computer Science',
          date_of_birth: '2003-01-01',
          age: 23,
          phone_number: '12345678',
          enrollment_date: '2025-08-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Academic Overview')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });
  });

  it('renders error message when API call fails', async () => {
    (studentApi.getStudentStats as any).mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Dashboard Data')).toBeInTheDocument();
    });
  });
});
