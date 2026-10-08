import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StillStuckModal } from '../components/StillStuckModal';

describe('StillStuckModal Component Tests', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <StillStuckModal isOpen={false} onClose={() => {}} onRediagnose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with accessible dialog role and fields when isOpen is true', () => {
    render(
      <StillStuckModal isOpen={true} onClose={() => {}} onRediagnose={() => {}} />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(/I'm Still Stuck — Re-evaluate Hypothesis/i)).toBeInTheDocument();

    // Verify all 4 observation field labels exist
    expect(screen.getByLabelText(/1\. What happened when you tried the recommended steps/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/2\. What did you expect to happen/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/3\. What actually happened/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/4\. New Error Logs/i)).toBeInTheDocument();
  });

  it('calls onClose when Cancel button or X close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <StillStuckModal isOpen={true} onClose={handleClose} onRediagnose={() => {}} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const closeButton = screen.getByRole('button', { name: /close dialog/i });
    await user.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('validates required fields before submitting', async () => {
    const user = userEvent.setup();
    const handleRediagnose = vi.fn();

    render(
      <StillStuckModal isOpen={true} onClose={() => {}} onRediagnose={handleRediagnose} />
    );

    const submitBtn = screen.getByRole('button', { name: /re-diagnose blocker/i });

    // Submit while empty
    await user.click(submitBtn);

    // Callback should not be called with empty values
    expect(handleRediagnose).not.toHaveBeenCalled();
  });

  it('submits valid observation payload when filled', async () => {
    const user = userEvent.setup();
    const handleRediagnose = vi.fn();

    render(
      <StillStuckModal isOpen={true} onClose={() => {}} onRediagnose={handleRediagnose} />
    );

    const whatTriedInput = screen.getByLabelText(/1\. What happened when you tried/i);
    const whatExpectedInput = screen.getByLabelText(/2\. What did you expect/i);
    const whatActuallyInput = screen.getByLabelText(/3\. What actually happened/i);
    const newLogsInput = screen.getByLabelText(/4\. New Error Logs/i);

    await user.type(whatTriedInput, 'Added CORS origins in express');
    await user.type(whatExpectedInput, 'Fetch request succeeds with 200');
    await user.type(whatActuallyInput, 'Still failing with 401 Unauthorized');
    await user.type(newLogsInput, 'Missing cookie header');

    const submitBtn = screen.getByRole('button', { name: /re-diagnose blocker/i });
    await user.click(submitBtn);

    expect(handleRediagnose).toHaveBeenCalledTimes(1);
    expect(handleRediagnose).toHaveBeenCalledWith({
      whatHappenedWhenTried: 'Added CORS origins in express',
      whatExpectedToHappen: 'Fetch request succeeds with 200',
      whatActuallyHappened: 'Still failing with 401 Unauthorized',
      newErrorOrLogs: 'Missing cookie header',
    });
  });
});
