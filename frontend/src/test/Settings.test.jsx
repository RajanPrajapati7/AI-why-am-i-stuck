import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Settings } from '../pages/Settings';
import * as AuthContext from '../context/AuthContext';
import api from '../api/client';

vi.mock('../api/client', () => ({
  default: {
    put: vi.fn(),
  },
}));

describe('Settings Page Component Tests', () => {
  const mockUser = {
    email: 'engineer@antigravity.ai',
    settings: {
      appearance: 'dark',
      aiPreferences: {
        enableCognitiveCoaching: true,
        enableSocraticQuestioning: true,
      },
    },
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const mockUpdateUser = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
      logout: mockLogout,
    });
  });

  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders application settings with initial user values', () => {
    renderWithRouter(<Settings />);

    expect(screen.getByRole('heading', { name: /application settings/i })).toBeInTheDocument();
    expect(screen.getByText(/engineer@antigravity.ai/)).toBeInTheDocument();

    // Verify switches
    const coachingSwitch = screen.getByRole('switch', { name: /enable cognitive coaching/i });
    const socraticSwitch = screen.getByRole('switch', { name: /enable socratic clarification questions/i });

    expect(coachingSwitch).toHaveAttribute('aria-checked', 'true');
    expect(socraticSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles AI preference switches interactively', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Settings />);

    const socraticSwitch = screen.getByRole('switch', { name: /enable socratic clarification questions/i });
    expect(socraticSwitch).toHaveAttribute('aria-checked', 'true');

    await user.click(socraticSwitch);
    expect(socraticSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('saves updated settings and calls API', async () => {
    const user = userEvent.setup();
    api.put.mockResolvedValueOnce({
      data: {
        success: true,
        user: {
          ...mockUser,
          settings: {
            appearance: 'system',
            aiPreferences: {
              enableCognitiveCoaching: true,
              enableSocraticQuestioning: false,
            },
          },
        },
      },
    });

    renderWithRouter(<Settings />);

    // Select System theme
    const systemRadio = screen.getByDisplayValue('system');
    await user.click(systemRadio);

    // Toggle Socratic switch to false
    const socraticSwitch = screen.getByRole('switch', { name: /enable socratic clarification questions/i });
    await user.click(socraticSwitch);

    // Save
    const saveBtn = screen.getByRole('button', { name: /save settings/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/auth/settings', {
        appearance: 'system',
        aiPreferences: {
          enableCognitiveCoaching: true,
          enableSocraticQuestioning: false,
        },
      });
      expect(mockUpdateUser).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/your application settings have been saved/i)).toBeInTheDocument();
    });
  });

  it('calls logout when Sign Out button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Settings />);

    const logoutBtn = screen.getByRole('button', { name: /log out of account/i });
    await user.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
