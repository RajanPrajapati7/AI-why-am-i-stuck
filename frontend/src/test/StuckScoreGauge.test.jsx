import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  StuckScorePanel,
  StuckScoreArc,
  StuckScoreBar,
  SeverityBadge,
} from '../components/StuckScoreGauge';

describe('StuckScoreGauge Component Suite', () => {
  describe('SeverityBadge', () => {
    it('renders MILD_BLOCKER badge with label', () => {
      render(<SeverityBadge severityLevel="MILD_BLOCKER" score={25} />);
      expect(screen.getByText('Mild Blocker')).toBeInTheDocument();
    });

    it('renders MODERATE_IMPASSE badge with label', () => {
      render(<SeverityBadge severityLevel="MODERATE_IMPASSE" score={50} />);
      expect(screen.getByText('Moderate Impasse')).toBeInTheDocument();
    });

    it('renders CRITICAL_DEADLOCK badge with label', () => {
      render(<SeverityBadge severityLevel="CRITICAL_DEADLOCK" score={80} />);
      expect(screen.getByText('Critical Deadlock')).toBeInTheDocument();
    });
  });

  describe('StuckScoreArc', () => {
    it('renders score number centered in arc', () => {
      render(<StuckScoreArc score={42} severityLevel="MODERATE_IMPASSE" />);
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('/ 100')).toBeInTheDocument();
    });

    it('renders placeholder dash when score is missing', () => {
      render(<StuckScoreArc score={null} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('StuckScoreBar', () => {
    it('renders horizontal progress bar with score and label', () => {
      render(<StuckScoreBar score={75} severityLevel="CRITICAL_DEADLOCK" />);
      expect(screen.getByText('Stuck Score')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('Critical Deadlock')).toBeInTheDocument();
    });

    it('returns null when score is missing', () => {
      const { container } = render(<StuckScoreBar score={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('StuckScorePanel (Workspace Integration Card)', () => {
    it('renders complete diagnosis panel with score and severity description', () => {
      render(
        <StuckScorePanel score={62} severityLevel="MODERATE_IMPASSE" />
      );

      expect(screen.getByText('Cognitive Stuck Score')).toBeInTheDocument();
      expect(screen.getByText('62')).toBeInTheDocument();
      expect(screen.getByText(/Moderate Impasse \(62\/100\)/)).toBeInTheDocument();
      expect(
        screen.getByText(/conceptual or mental-model adjustment is needed/i)
      ).toBeInTheDocument();
    });

    it('handles NaN or undefined score safely without throwing an error', () => {
      render(<StuckScorePanel score={NaN} />);
      expect(screen.getByText('Cognitive Stuck Score')).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
      expect(screen.getByText(/Calculating impasse severity/i)).toBeInTheDocument();
    });
  });
});
