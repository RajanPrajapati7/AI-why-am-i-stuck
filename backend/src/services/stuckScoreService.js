/**
 * Stuck-Score Calculation Service
 * 
 * Formal Mathematical Formulation:
 * StuckScore = min(100, round(B_type + W_attempts * N_attempts + W_duration * T_stuck + W_ambiguity * (1 - C_AI)))
 */

const BASE_TAXONOMY_WEIGHTS = {
  ARCHITECTURAL_DEADLOCK: 45,
  SCOPE_PARALYSIS: 40,
  EDGE_CASE_BLINDSPOT: 35,
  MENTAL_MODEL_DISTORTION: 30,
  CONCEPTUAL_GAP: 25,
  ENVIRONMENT_OR_CONFIG_DRIFT: 20,
  SYNTAX_OR_RUNTIME_DEFECT: 15,
};

const SEVERITY_LEVELS = {
  MILD_BLOCKER: 'MILD_BLOCKER',       // 0 - 35
  MODERATE_IMPASSE: 'MODERATE_IMPASSE', // 36 - 65
  CRITICAL_DEADLOCK: 'CRITICAL_DEADLOCK', // 66 - 100
};

/**
 * Parses user text in whatAlreadyTried to count distinct attempted approaches.
 * @param {string} whatAlreadyTried
 * @returns {number} count between 1 and 5
 */
export const countAttemptedRemedies = (whatAlreadyTried = '') => {
  if (!whatAlreadyTried || typeof whatAlreadyTried !== 'string') return 1;

  // Split by line breaks, bullet points, numbers, commas, or semicolons
  const linesOrClauses = whatAlreadyTried
    .split(/[\n;\u2022\u25E6-]|(?:\d+\.)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const count = linesOrClauses.length;
  // Clamp between 1 and 5
  return Math.min(5, Math.max(1, count));
};

/**
 * Estimates duration weight from problem statement text or explicit minutes.
 * @param {string} text
 * @param {number} [explicitMinutes]
 * @returns {number} points (0 to 15)
 */
export const estimateDurationPoints = (text = '', explicitMinutes = null) => {
  if (typeof explicitMinutes === 'number' && explicitMinutes > 0) {
    if (explicitMinutes > 120) return 15;
    if (explicitMinutes >= 60) return 10;
    if (explicitMinutes >= 30) return 5;
    return 0;
  }

  const lower = (text || '').toLowerCase();
  if (
    lower.includes('days') ||
    lower.includes('day') ||
    lower.includes('hours') ||
    lower.includes('all night') ||
    lower.includes('several hours') ||
    lower.includes('yesterday')
  ) {
    return 15;
  }
  if (lower.includes('hour') || lower.includes('60 min') || lower.includes('an hour')) {
    return 10;
  }
  if (lower.includes('30 min') || lower.includes('half hour') || lower.includes('awhile')) {
    return 5;
  }

  // Baseline moderate duration if unspecified
  return 5;
};

/**
 * Classifies numerical score into human-readable severity level.
 * @param {number} score (0-100)
 * @returns {'MILD_BLOCKER' | 'MODERATE_IMPASSE' | 'CRITICAL_DEADLOCK'}
 */
export const classifySeverityLevel = (score) => {
  if (score <= 35) return SEVERITY_LEVELS.MILD_BLOCKER;
  if (score <= 65) return SEVERITY_LEVELS.MODERATE_IMPASSE;
  return SEVERITY_LEVELS.CRITICAL_DEADLOCK;
};

/**
 * Computes composite Stuck Score (0 - 100) and severity rating.
 * 
 * @param {Object} params
 * @param {string} params.stuckType - One of the 7 taxonomy enums
 * @param {number} [params.confidenceScore=0.9] - AI confidence (0.0 - 1.0)
 * @param {string} [params.whatAlreadyTried=''] - User's prior attempts text
 * @param {string} [params.fullProblemText=''] - Full text for context duration parsing
 * @param {number} [params.durationMinutes] - Optional explicit duration in minutes
 * @returns {{ stuckScore: number, severityLevel: string, breakdown: Object }}
 */
export const calculateStuckScore = ({
  stuckType,
  confidenceScore = 0.9,
  whatAlreadyTried = '',
  fullProblemText = '',
  durationMinutes = null,
}) => {
  // 1. Base Taxonomy Weight (15 - 45)
  const baseWeight = BASE_TAXONOMY_WEIGHTS[stuckType] || 25;

  // 2. Attempt Multiplier (5 pts per attempt, capped at 25)
  const attemptCount = countAttemptedRemedies(whatAlreadyTried);
  const attemptPoints = attemptCount * 5;

  // 3. Duration Points (0 - 15)
  const combinedText = `${fullProblemText} ${whatAlreadyTried}`;
  const durationPoints = estimateDurationPoints(combinedText, durationMinutes);

  // 4. Ambiguity / Diagnostic Uncertainty Weight (0 - 15)
  const clampedConfidence = Math.max(0, Math.min(1, confidenceScore));
  const ambiguityPoints = Math.round(15 * (1 - clampedConfidence));

  // Composite sum
  const rawScore = baseWeight + attemptPoints + durationPoints + ambiguityPoints;
  const stuckScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  const severityLevel = classifySeverityLevel(stuckScore);

  return {
    stuckScore,
    severityLevel,
    breakdown: {
      baseWeight,
      attemptCount,
      attemptPoints,
      durationPoints,
      ambiguityPoints,
    },
  };
};
