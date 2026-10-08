import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StuckScorePanel } from '../components/StuckScoreGauge';
import { StuckTypeBadge } from '../components/StuckTypeBadge';
import { DomainBadge } from '../components/DomainBadge';
import { StatusBadge } from '../components/StatusBadge';

describe('Cognitive Diagnosis UI Components', () => {
  describe('StuckTypeBadge', () => {
    it('renders correct label and icon for MENTAL_MODEL_DISTORTION', () => {
      render(<StuckTypeBadge type="MENTAL_MODEL_DISTORTION" />);
      expect(screen.getByText('Mental Model Distortion')).toBeInTheDocument();
    });

    it('renders correct label for ENVIRONMENT_OR_CONFIG_DRIFT', () => {
      render(<StuckTypeBadge type="ENVIRONMENT_OR_CONFIG_DRIFT" />);
      expect(screen.getByText('Environment / Config Drift')).toBeInTheDocument();
    });

    it('handles unknown or empty stuck types safely with fallback label', () => {
      render(<StuckTypeBadge type={null} />);
      expect(screen.getByText('Diagnosing...')).toBeInTheDocument();
    });
  });

  describe('DomainBadge & StatusBadge', () => {
    it('renders domain badge', () => {
      render(<DomainBadge domain="CODING_DEBUGGING" />);
      expect(screen.getByText('Coding & Debugging')).toBeInTheDocument();
    });

    it('renders status badge for PLAN_READY and RESOLVED', () => {
      const { rerender } = render(<StatusBadge status="PLAN_READY" />);
      expect(screen.getByText('Plan Ready')).toBeInTheDocument();

      rerender(<StatusBadge status="RESOLVED" />);
      expect(screen.getByText('Resolved')).toBeInTheDocument();
    });
  });

  describe('Diagnosis Summary Card Integration', () => {
    it('renders diagnostic explanation fields with StuckScorePanel', () => {
      const mockDiagnosis = {
        stuckType: 'MENTAL_MODEL_DISTORTION',
        stuckScore: 48,
        severityLevel: 'MODERATE_IMPASSE',
        confidenceScore: 0.92,
        rootCauseSummary: 'State mutation inside effect triggers continuous loop',
        whyYouAreStuck: 'You assume the hook only runs on user actions',
        keyMisconception: 'New object references in render defeat memoization',
      };

      render(
        <div data-testid="stage-1-card" className="space-y-4">
          <StuckScorePanel
            score={mockDiagnosis.stuckScore}
            severityLevel={mockDiagnosis.severityLevel}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3>Why You Are Stuck:</h3>
              <p>{mockDiagnosis.whyYouAreStuck}</p>
            </div>
            <div>
              <h3>Key Misconception:</h3>
              <p>{mockDiagnosis.keyMisconception}</p>
            </div>
          </div>
        </div>
      );

      // Verify StuckScorePanel
      expect(screen.getByText('48')).toBeInTheDocument();
      expect(screen.getByText(/Moderate Impasse \(48\/100\)/)).toBeInTheDocument();

      // Verify Cognitive explanations
      expect(
        screen.getByText('You assume the hook only runs on user actions')
      ).toBeInTheDocument();
      expect(
        screen.getByText('New object references in render defeat memoization')
      ).toBeInTheDocument();
    });
  });
});
