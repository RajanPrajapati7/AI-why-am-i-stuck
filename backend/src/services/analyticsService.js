import { StuckSession } from '../models/StuckSession.js';
import { UserPattern } from '../models/UserPattern.js';
import { synthesizeLearningPatternsAI } from './geminiService.js';

export const calculateAggregatedMetrics = (sessions = []) => {
  const totalSessionsCount = sessions.length;
  const resolvedSessions = sessions.filter((s) => s.status === 'RESOLVED');
  const resolvedSessionsCount = resolvedSessions.length;

  let totalTimeToUnstuck = 0;
  let timedSessionsCount = 0;

  const stuckTypeFrequencies = {
    SYNTAX_OR_RUNTIME_DEFECT: 0,
    CONCEPTUAL_GAP: 0,
    MENTAL_MODEL_DISTORTION: 0,
    ENVIRONMENT_OR_CONFIG_DRIFT: 0,
    ARCHITECTURAL_DEADLOCK: 0,
    SCOPE_PARALYSIS: 0,
    EDGE_CASE_BLINDSPOT: 0,
  };

  const tagCounts = {};

  sessions.forEach((session) => {
    // Frequencies
    const st = session.diagnosis?.stuckType;
    if (st && stuckTypeFrequencies[st] !== undefined) {
      stuckTypeFrequencies[st] += 1;
    }

    // Resolution duration
    if (session.resolution?.timeToUnstuckMinutes) {
      totalTimeToUnstuck += session.resolution.timeToUnstuckMinutes;
      timedSessionsCount += 1;
    }

    // Tags
    if (session.tags && Array.isArray(session.tags)) {
      session.tags.forEach((tag) => {
        const clean = tag.toLowerCase().trim();
        if (clean) {
          tagCounts[clean] = (tagCounts[clean] || 0) + 1;
        }
      });
    }
  });

  const averageTimeToUnstuckMinutes =
    timedSessionsCount > 0 ? Math.round(totalTimeToUnstuck / timedSessionsCount) : 0;

  const recurringTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const resolutionRate =
    totalSessionsCount > 0 ? Math.round((resolvedSessionsCount / totalSessionsCount) * 100) : 0;

  return {
    totalSessionsCount,
    resolvedSessionsCount,
    resolutionRate,
    averageTimeToUnstuckMinutes,
    stuckTypeFrequencies,
    recurringTags,
  };
};

export const recalculateUserPatterns = async (userId) => {
  const sessions = await StuckSession.find({ userId }).sort({ createdAt: -1 });
  const metrics = calculateAggregatedMetrics(sessions);

  // Summarize sessions for AI pattern synthesis
  const sessionsSummary = sessions.slice(0, 10).map((s) => ({
    title: s.title,
    domain: s.domain,
    stuckType: s.diagnosis?.stuckType,
    rootCause: s.diagnosis?.rootCauseSummary,
    whatFixedIt: s.resolution?.whatActuallyFixedIt || 'Pending',
    reflection: s.resolution?.reflectionNotes || 'None',
  }));

  const aiSynthesis = await synthesizeLearningPatternsAI({ sessionsSummary });

  const patternDoc = await UserPattern.findOneAndUpdate(
    { userId },
    {
      userId,
      totalSessionsCount: metrics.totalSessionsCount,
      resolvedSessionsCount: metrics.resolvedSessionsCount,
      averageTimeToUnstuckMinutes: metrics.averageTimeToUnstuckMinutes,
      stuckTypeFrequencies: metrics.stuckTypeFrequencies,
      recurringTags: metrics.recurringTags,
      identifiedBlindspots: aiSynthesis.identifiedBlindspots || [],
      lastAggregatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return patternDoc;
};
