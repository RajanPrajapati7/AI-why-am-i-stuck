import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profile } from '../pages/Profile';
import * as AuthContext from '../context/AuthContext';
import api from '../api/client';

vi.mock('../api/client', () => ({
  default: {
    put: vi.fn(),
  },
}));

describe('Profile Page Component Tests', () => {
  const mockUser = {
    name: 'Ada Lovelace',
    email: 'ada@computing.org',
    experienceLevel: 'INTERMEDIATE',
    primaryTechStack: ['React', 'JavaScript'],
  };

  const mockUpdateUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      updateUser: mockUpdateUser,
    });
  });

  it('renders profile form with populated user information', () => {
    render(<Profile />);

    expect(screen.getByRole('heading', { name: /developer profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Ada Lovelace');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('ada@computing.org');
    expect(screen.getByDisplayValue('Ada Lovelace')).toBeInTheDocument();

    // Verify tech stack tags rendered
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('allows adding and removing technology tags', async () => {
    const user = userEvent.setup();
    render(<Profile />);

    const techInput = screen.getByPlaceholderText(/add technology/i);
    const addBtn = screen.getByRole('button', { name: /add technology to list/i });

    // Add TypeScript
    await user.type(techInput, 'TypeScript');
    await user.click(addBtn);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();

    // Remove React
    const removeReactBtn = screen.getByRole('button', { name: /remove react from tech stack/i });
    await user.click(removeReactBtn);

    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('submits updated profile and shows accessible success message', async () => {
    const user = userEvent.setup();
    api.put.mockResolvedValueOnce({
      data: {
        success: true,
        user: {
          ...mockUser,
          name: 'Ada Lovelace Lead',
          experienceLevel: 'ADVANCED',
        },
      },
    });

    render(<Profile />);

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Ada Lovelace Lead');

    // Select Advanced level
    const advancedRadio = screen.getByRole('radio', { name: /advanced/i });
    await user.click(advancedRadio);

    const saveBtn = screen.getByRole('button', { name: /save profile/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/auth/profile', {
        name: 'Ada Lovelace Lead',
        experienceLevel: 'ADVANCED',
        primaryTechStack: ['React', 'JavaScript'],
      });
      expect(mockUpdateUser).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/your profile has been successfully updated/i)).toBeInTheDocument();
    });
  });

  it('displays validation error if name is empty', async () => {
    const user = userEvent.setup();
    render(<Profile />);

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);

    const saveBtn = screen.getByRole('button', { name: /save profile/i });
    await user.click(saveBtn);

    expect(api.put).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/name cannot be empty/i);
  });
});
