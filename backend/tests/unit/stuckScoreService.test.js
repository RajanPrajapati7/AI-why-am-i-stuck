import { describe, it, expect } from 'vitest';
import {
  calculateStuckScore,
  classifySeverityLevel,
  countAttemptedRemedies,
  estimateDurationPoints,
} from '../../src/services/stuckScoreService.js';

describe('StuckScore Service Unit Tests', () => {
  describe('countAttemptedRemedies', () => {
    it('returns 1 for empty or missing inputs', () => {
      expect(countAttemptedRemedies('')).toBe(1);
      expect(countAttemptedRemedies(null)).toBe(1);
      expect(countAttemptedRemedies(undefined)).toBe(1);
      expect(countAttemptedRemedies(123)).toBe(1);
    });

    it('parses multiple remedies separated by newlines, bullets, or numbers', () => {
      const remedies = `
        1. Restarted the dev server and cleared cache
        2. Checked network tab for 500 status codes
        3. Updated npm packages and rebuilt
      `;
      expect(countAttemptedRemedies(remedies)).toBe(3);
    });

    it('clamps remedies count between 1 and 5', () => {
      const manyRemedies = `
        - Checked the log files carefully
        - Restarted Docker container
        - Rebuilt webpack bundle
        - Checked MongoDB connection pool
        - Downgraded library version
        - Tested with curl from CLI
        - Rebooted the machine
      `;
      expect(countAttemptedRemedies(manyRemedies)).toBe(5);
    });
  });

  describe('estimateDurationPoints', () => {
    it('uses explicit duration minutes when provided', () => {
      expect(estimateDurationPoints('', 15)).toBe(0);
      expect(estimateDurationPoints('', 35)).toBe(5);
      expect(estimateDurationPoints('', 75)).toBe(10);
      expect(estimateDurationPoints('', 180)).toBe(15);
    });

    it('infers points from descriptive keywords in text', () => {
      expect(estimateDurationPoints('I have been stuck for days')).toBe(15);
      expect(estimateDurationPoints('Stuck all night trying to debug')).toBe(15);
      expect(estimateDurationPoints('Working on this for an hour')).toBe(10);
      expect(estimateDurationPoints('Been trying for 30 min')).toBe(5);
    });

    it('defaults to moderate baseline points if text is unspecified', () => {
      expect(estimateDurationPoints('')).toBe(5);
      expect(estimateDurationPoints(null)).toBe(5);
    });
  });

  describe('classifySeverityLevel', () => {
    it('classifies scores <= 35 as MILD_BLOCKER', () => {
      expect(classifySeverityLevel(0)).toBe('MILD_BLOCKER');
      expect(classifySeverityLevel(20)).toBe('MILD_BLOCKER');
      expect(classifySeverityLevel(35)).toBe('MILD_BLOCKER');
    });

    it('classifies scores between 36 and 65 as MODERATE_IMPASSE', () => {
      expect(classifySeverityLevel(36)).toBe('MODERATE_IMPASSE');
      expect(classifySeverityLevel(50)).toBe('MODERATE_IMPASSE');
      expect(classifySeverityLevel(65)).toBe('MODERATE_IMPASSE');
    });

    it('classifies scores >= 66 as CRITICAL_DEADLOCK', () => {
      expect(classifySeverityLevel(66)).toBe('CRITICAL_DEADLOCK');
      expect(classifySeverityLevel(85)).toBe('CRITICAL_DEADLOCK');
      expect(classifySeverityLevel(100)).toBe('CRITICAL_DEADLOCK');
    });
  });

  describe('calculateStuckScore', () => {
    it('calculates score within valid boundaries (0 to 100)', () => {
      const result = calculateStuckScore({
        stuckType: 'ARCHITECTURAL_DEADLOCK',
        confidenceScore: 0.85,
        whatAlreadyTried: '1. Rewrote service. 2. Created proxy. 3. Reconfigured ports.',
        fullProblemText: 'Deadlock between microservices for 3 days',
      });

      expect(result.stuckScore).toBeGreaterThanOrEqual(0);
      expect(result.stuckScore).toBeLessThanOrEqual(100);
      expect(['MILD_BLOCKER', 'MODERATE_IMPASSE', 'CRITICAL_DEADLOCK']).toContain(result.severityLevel);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.baseWeight).toBe(45);
    });

    it('handles mild blocker conditions correctly', () => {
      const result = calculateStuckScore({
        stuckType: 'SYNTAX_OR_RUNTIME_DEFECT',
        confidenceScore: 0.95,
        whatAlreadyTried: 'Looked at line 4',
        durationMinutes: 10,
      });

      expect(result.stuckScore).toBeLessThanOrEqual(35);
      expect(result.severityLevel).toBe('MILD_BLOCKER');
    });

    it('handles critical deadlock conditions correctly', () => {
      const result = calculateStuckScore({
        stuckType: 'ARCHITECTURAL_DEADLOCK',
        confidenceScore: 0.2, // high ambiguity
        whatAlreadyTried: `
          1. Refactored event loop
          2. Converted to async messaging
          3. Added redis pubsub
          4. Rewrote data ingestion
          5. Changed thread pool
        `,
        durationMinutes: 240, // 4 hours
      });

      expect(result.stuckScore).toBeGreaterThanOrEqual(66);
      expect(result.severityLevel).toBe('CRITICAL_DEADLOCK');
    });

    it('is completely deterministic given the same inputs', () => {
      const params = {
        stuckType: 'MENTAL_MODEL_DISTORTION',
        confidenceScore: 0.8,
        whatAlreadyTried: 'Tried useEffect cleanup, memoized callback',
        durationMinutes: 45,
      };

      const run1 = calculateStuckScore(params);
      const run2 = calculateStuckScore(params);

      expect(run1.stuckScore).toBe(run2.stuckScore);
      expect(run1.severityLevel).toBe(run2.severityLevel);
      expect(run1.breakdown).toEqual(run2.breakdown);
    });

    it('handles missing and undefined parameters gracefully with defaults', () => {
      const result = calculateStuckScore({});

      expect(result.stuckScore).toBeGreaterThanOrEqual(0);
      expect(result.stuckScore).toBeLessThanOrEqual(100);
      expect(result.severityLevel).toBeDefined();
      expect(result.breakdown.baseWeight).toBe(25); // default taxonomy weight
    });
  });
});
