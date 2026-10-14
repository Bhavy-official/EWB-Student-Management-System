import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AIAssistantPage } from '../pages/AIAssistantPage';
import { studentApi } from '../services/api';

vi.mock('../services/api', () => ({
  studentApi: {
    getAIStatus: vi.fn().mockResolvedValue({
      provider: 'google-gemini',
      configured: false,
      model: 'gemini-1.5-flash',
      mode: 'deterministic-fallback',
    }),
    askAI: vi.fn(),
  },
  getApiErrorMessage: (err: any) => 'Mock error',
}));

describe('AIAssistantPage', () => {
  it('renders welcome message and quick inquiry prompts', async () => {
    render(
      <BrowserRouter>
        <AIAssistantPage />
      </BrowserRouter>
    );

    expect(screen.getByText('AI Student Assistant')).toBeInTheDocument();
    expect(screen.getByText('Quick Inquiries')).toBeInTheDocument();
    expect(
      screen.getByText('How many students are currently registered?')
    ).toBeInTheDocument();
  });

  it('submits query and displays grounded response', async () => {
    (studentApi.askAI as any).mockResolvedValueOnce({
      answer: 'There are currently 18 students registered in the system.',
      intent: 'total_count',
      grounded_data: {
        type: 'count',
        title: 'Total Registered Students',
        count: 18,
      },
      ai_enabled: false,
      model: 'local-deterministic-engine',
    });

    render(
      <BrowserRouter>
        <AIAssistantPage />
      </BrowserRouter>
    );

    const input = screen.getByPlaceholderText(
      'Type your question about students, courses, or trends...'
    );
    fireEvent.change(input, { target: { value: 'How many students?' } });

    const sendBtn = screen.getByText('Send');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(
        screen.getByText('There are currently 18 students registered in the system.')
      ).toBeInTheDocument();
    });
  });
});
