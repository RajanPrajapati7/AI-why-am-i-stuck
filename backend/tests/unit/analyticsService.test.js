import { describe, it, expect } from 'vitest';
import { calculateAggregatedMetrics } from '../../src/services/analyticsService.js';

describe('Analytics Service Unit Tests', () => {
  it('handles empty session collections gracefully', () => {
    const metrics = calculateAggregatedMetrics([]);

    expect(metrics.totalSessionsCount).toBe(0);
    expect(metrics.resolvedSessionsCount).toBe(0);
    expect(metrics.resolutionRate).toBe(0);
    expect(metrics.averageTimeToUnstuckMinutes).toBe(0);
    expect(metrics.recurringTags).toEqual([]);
    expect(metrics.stuckTypeFrequencies.SYNTAX_OR_RUNTIME_DEFECT).toBe(0);
    expect(metrics.stuckTypeFrequencies.ARCHITECTURAL_DEADLOCK).toBe(0);
  });

  it('aggregates sessions and computes accurate resolution rate', () => {
    const mockSessions = [
      {
        status: 'RESOLVED',
        diagnosis: { stuckType: 'CONCEPTUAL_GAP' },
        resolution: { timeToUnstuckMinutes: 20 },
        tags: ['React', 'Hooks'],
      },
      {
        status: 'RESOLVED',
        diagnosis: { stuckType: 'CONCEPTUAL_GAP' },
        resolution: { timeToUnstuckMinutes: 40 },
        tags: ['React', 'State'],
      },
      {
        status: 'DIAGNOSED',
        diagnosis: { stuckType: 'ARCHITECTURAL_DEADLOCK' },
        tags: ['Docker', 'Microservices'],
      },
      {
        status: 'IN_PROGRESS',
        diagnosis: { stuckType: 'SYNTAX_OR_RUNTIME_DEFECT' },
        tags: ['React'],
      },
    ];

    const metrics = calculateAggregatedMetrics(mockSessions);

    expect(metrics.totalSessionsCount).toBe(4);
    expect(metrics.resolvedSessionsCount).toBe(2);
    // 2 / 4 = 50%
    expect(metrics.resolutionRate).toBe(50);
  });

  it('calculates average time-to-unstuck only across resolved sessions with duration', () => {
    const mockSessions = [
      {
        status: 'RESOLVED',
        resolution: { timeToUnstuckMinutes: 15 },
      },
      {
        status: 'RESOLVED',
        resolution: { timeToUnstuckMinutes: 45 },
      },
      {
        status: 'RESOLVED',
        resolution: {}, // missing time
      },
      {
        status: 'IN_PROGRESS',
      },
    ];

    const metrics = calculateAggregatedMetrics(mockSessions);
    // (15 + 45) / 2 = 30
    expect(metrics.averageTimeToUnstuckMinutes).toBe(30);
  });

  it('accurately counts stuck type frequencies across taxonomy', () => {
    const mockSessions = [
      { diagnosis: { stuckType: 'MENTAL_MODEL_DISTORTION' } },
      { diagnosis: { stuckType: 'MENTAL_MODEL_DISTORTION' } },
      { diagnosis: { stuckType: 'ENVIRONMENT_OR_CONFIG_DRIFT' } },
      { diagnosis: { stuckType: 'SCOPE_PARALYSIS' } },
      { diagnosis: { stuckType: 'UNKNOWN_TYPE_SHOULD_BE_IGNORED' } },
    ];

    const metrics = calculateAggregatedMetrics(mockSessions);

    expect(metrics.stuckTypeFrequencies.MENTAL_MODEL_DISTORTION).toBe(2);
    expect(metrics.stuckTypeFrequencies.ENVIRONMENT_OR_CONFIG_DRIFT).toBe(1);
    expect(metrics.stuckTypeFrequencies.SCOPE_PARALYSIS).toBe(1);
    expect(metrics.stuckTypeFrequencies.SYNTAX_OR_RUNTIME_DEFECT).toBe(0);
  });

  it('normalizes, counts, sorts, and limits recurring tags', () => {
    const mockSessions = [
      { tags: ['React', 'JavaScript', 'Tailwind'] },
      { tags: ['react', 'TypeScript'] },
      { tags: ['REACT', 'Node.js'] },
      { tags: ['react', 'tailwind'] },
    ];

    const metrics = calculateAggregatedMetrics(mockSessions);

    expect(metrics.recurringTags[0]).toEqual({ tag: 'react', count: 4 });
    expect(metrics.recurringTags[1]).toEqual({ tag: 'tailwind', count: 2 });
    expect(metrics.recurringTags.length).toBeLessThanOrEqual(10);
  });
});
