import { z } from 'zod';
import { StuckSession } from '../models/StuckSession.js';
import {
  diagnoseProblemAI,
  generateSolutionAI,
  rediagnoseProblemAI,
} from '../services/geminiService.js';
import { recalculateUserPatterns } from '../services/analyticsService.js';
import { calculateStuckScore } from '../services/stuckScoreService.js';

export const createSessionSchema = z.object({
  domain: z.enum([
    'CODING_DEBUGGING',
    'ARCHITECTURE_DESIGN',
    'TOOLING_ENVIRONMENT',
    'CONCEPTUAL_LEARNING',
    'ALGORITHMS_LOGIC',
  ]),
  whatTryingToDo: z.string().min(5, 'Please describe what you are trying to do'),
  whatHappeningInstead: z.string().min(5, 'Please describe what is happening instead'),
  whatAlreadyTried: z.string().min(3, 'Please describe what you already tried'),
  codeSnippetOrLogs: z.string().optional().default(''),
  techStackContext: z.array(z.string()).optional().default([]),
});

export const submitAnswersSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      responseText: z.string().min(1, 'Response cannot be empty'),
    })
  ),
});

export const resolveSessionSchema = z.object({
  whatActuallyFixedIt: z.string().min(3, 'Please summarize what resolved the issue'),
  reflectionNotes: z.string().optional().default(''),
  userHelpfulnessRating: z.number().min(1).max(5).optional().default(5),
});

export const rediagnoseSessionSchema = z.object({
  whatHappenedWhenTried: z.string().min(3, 'Please describe what happened when you tried the recommended steps'),
  whatExpectedToHappen: z.string().min(3, 'Please describe what you expected to happen'),
  whatActuallyHappened: z.string().min(3, 'Please describe what actually happened instead'),
  newErrorOrLogs: z.string().optional().default(''),
});

/**
 * Step 1-3: Create Session & Run Initial AI Stuck Diagnosis
 */
export const createSession = async (req, res, next) => {
  try {
    const {
      domain,
      whatTryingToDo,
      whatHappeningInstead,
      whatAlreadyTried,
      codeSnippetOrLogs,
      techStackContext,
    } = req.body;

    // Generate concise title from goal
    const title =
      whatTryingToDo.length > 60
        ? `${whatTryingToDo.slice(0, 57)}...`
        : whatTryingToDo;

    // Run Stage 1 AI diagnosis
    const diagnosisResult = await diagnoseProblemAI({
      problemStatement: {
        whatTryingToDo,
        whatHappeningInstead,
        whatAlreadyTried,
        codeSnippetOrLogs,
        techStackContext: techStackContext.length > 0 ? techStackContext : req.user.primaryTechStack,
      },
      domain,
      experienceLevel: req.user.experienceLevel,
    });

    // Calculate composite stuck score (0-100) and severity rating
    const scoreData = calculateStuckScore({
      stuckType: diagnosisResult.stuckType,
      confidenceScore: diagnosisResult.confidenceScore,
      whatAlreadyTried,
      fullProblemText: `${whatTryingToDo} ${whatHappeningInstead}`,
    });

    const session = await StuckSession.create({
      userId: req.user._id,
      title,
      domain,
      status: 'QUESTIONS_PENDING',
      problemStatement: {
        whatTryingToDo,
        whatHappeningInstead,
        whatAlreadyTried,
        codeSnippetOrLogs,
        techStackContext: techStackContext.length > 0 ? techStackContext : req.user.primaryTechStack,
      },
      diagnosis: {
        stuckType: diagnosisResult.stuckType,
        confidenceScore: diagnosisResult.confidenceScore,
        stuckScore: scoreData.stuckScore,
        severityLevel: scoreData.severityLevel,
        rootCauseSummary: diagnosisResult.rootCauseSummary,
        whyYouAreStuck: diagnosisResult.whyYouAreStuck,
        keyMisconception: diagnosisResult.keyMisconception,
      },
      clarificationQuestions: diagnosisResult.clarificationQuestions || [],
      tags: diagnosisResult.suggestedTags || [],
    });

    // Fire & forget pattern update
    recalculateUserPatterns(req.user._id).catch((err) =>
      console.error('[Pattern Update Error]:', err.message)
    );

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all sessions for active user
 */
export const getSessions = async (req, res, next) => {
  try {
    const { status, domain, search, page = 1, limit = 10 } = req.query;

    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (domain) query.domain = domain;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sessions, total] = await Promise.all([
      StuckSession.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      StuckSession.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single session
 */
export const getSessionById = async (req, res, next) => {
  try {
    const session = await StuckSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Stuck session not found',
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 4: Submit Answers to Socratic Questions & Generate Action Plan
 */
export const submitAnswers = async (req, res, next) => {
  try {
    const { answers } = req.body;

    const session = await StuckSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Stuck session not found',
      });
    }

    // Attach user answers to questions
    session.clarificationQuestions.forEach((q) => {
      const match = answers.find((a) => a.questionId === q.questionId);
      if (match) {
        q.userResponse = match.responseText;
        q.answeredAt = new Date();
      }
    });

    // Run Stage 2 AI Solution Generation
    const solutionResult = await generateSolutionAI({
      problemStatement: session.problemStatement,
      diagnosis: session.diagnosis,
      clarificationQuestions: session.clarificationQuestions,
    });

    session.solution = {
      mentalModelExplanation: solutionResult.mentalModelExplanation,
      correctApproachOverview: solutionResult.correctApproachOverview,
      antiPatternsToAvoid: solutionResult.antiPatternsToAvoid || [],
      actionItems: (solutionResult.actionItems || []).map((item, idx) => ({
        order: item.order || idx + 1,
        task: item.task,
        rationale: item.rationale,
        codeSnippet: item.codeSnippet || '',
        completed: false,
      })),
      verificationTest: solutionResult.verificationTest,
    };

    session.status = 'PLAN_READY';
    await session.save();

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 5: Toggle Action Item status
 */
export const toggleActionItem = async (req, res, next) => {
  try {
    const { completed } = req.body;
    const { id, actionIndex } = req.params;

    const session = await StuckSession.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!session || !session.solution?.actionItems) {
      return res.status(404).json({
        success: false,
        message: 'Session or action items not found',
      });
    }

    const idx = parseInt(actionIndex, 10);
    if (idx < 0 || idx >= session.solution.actionItems.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action item index',
      });
    }

    session.solution.actionItems[idx].completed = completed;
    session.solution.actionItems[idx].completedAt = completed ? new Date() : null;

    // If at least one item is checked, move to IN_PROGRESS
    if (session.status === 'PLAN_READY' && completed) {
      session.status = 'IN_PROGRESS';
    }

    await session.save();

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 6: Mark Session as Resolved with Post-Mortem Reflection
 */
export const resolveSession = async (req, res, next) => {
  try {
    const { whatActuallyFixedIt, reflectionNotes, userHelpfulnessRating } = req.body;

    const session = await StuckSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Stuck session not found',
      });
    }

    const now = new Date();
    const durationMinutes = Math.max(
      1,
      Math.round((now.getTime() - new Date(session.createdAt).getTime()) / (1000 * 60))
    );

    session.status = 'RESOLVED';
    session.resolution = {
      resolvedAt: now,
      timeToUnstuckMinutes: durationMinutes,
      whatActuallyFixedIt,
      reflectionNotes: reflectionNotes || '',
      userHelpfulnessRating: userHelpfulnessRating || 5,
    };

    // Mark all action items as completed if not already
    if (session.solution?.actionItems) {
      session.solution.actionItems.forEach((item) => {
        if (!item.completed) {
          item.completed = true;
          item.completedAt = now;
        }
      });
    }

    await session.save();

    // Trigger learning pattern aggregation
    const updatedPatterns = await recalculateUserPatterns(req.user._id);

    res.status(200).json({
      success: true,
      session,
      patterns: updatedPatterns,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Abandon or delete session
 */
export const abandonSession = async (req, res, next) => {
  try {
    const session = await StuckSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'ABANDONED' },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    recalculateUserPatterns(req.user._id).catch(() => {});

    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await StuckSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    recalculateUserPatterns(req.user._id).catch(() => {});

    res.status(200).json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 7: "Still Stuck" - Re-evaluate hypothesis with new observations & generate revised action plan
 */
export const rediagnoseSession = async (req, res, next) => {
  try {
    const {
      whatHappenedWhenTried,
      whatExpectedToHappen,
      whatActuallyHappened,
      newErrorOrLogs,
    } = req.body;

    const session = await StuckSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Stuck session not found',
      });
    }

    if (session.status === 'RESOLVED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot re-diagnose an already resolved session.',
      });
    }

    // Extract attempted action items
    const attemptedActionItems = (session.solution?.actionItems || []).filter(
      (a) => a.completed
    );

    // Snapshot current state into revisions array before mutating
    const previousSnapshot = {
      revisedAt: new Date(),
      previousDiagnosis: {
        stuckType: session.diagnosis?.stuckType,
        stuckScore: session.diagnosis?.stuckScore,
        severityLevel: session.diagnosis?.severityLevel,
        rootCauseSummary: session.diagnosis?.rootCauseSummary,
        whyYouAreStuck: session.diagnosis?.whyYouAreStuck,
        keyMisconception: session.diagnosis?.keyMisconception,
      },
      previousSolution: {
        mentalModelExplanation: session.solution?.mentalModelExplanation,
        correctApproachOverview: session.solution?.correctApproachOverview,
        actionItems: session.solution?.actionItems || [],
        verificationTest: session.solution?.verificationTest,
      },
      newObservations: {
        whatHappenedWhenTried,
        whatExpectedToHappen,
        whatActuallyHappened,
        newErrorOrLogs,
      },
    };

    // Run Stage 2 Re-diagnosis AI engine
    const revised = await rediagnoseProblemAI({
      problemStatement: session.problemStatement,
      previousDiagnosis: session.diagnosis,
      clarificationQuestions: session.clarificationQuestions,
      previousSolution: session.solution,
      attemptedActionItems,
      newObservations: {
        whatHappenedWhenTried,
        whatExpectedToHappen,
        whatActuallyHappened,
        newErrorOrLogs,
      },
      domain: session.domain,
      experienceLevel: req.user.experienceLevel,
    });

    previousSnapshot.reEvaluationRationale = revised.reEvaluationRationale;
    if (!session.revisions) {
      session.revisions = [];
    }
    session.revisions.push(previousSnapshot);

    // Calculate revised Stuck Score with updated empirical evidence & attempts
    const combinedNewText = `${session.problemStatement?.whatAlreadyTried || ''} ${whatHappenedWhenTried} ${whatActuallyHappened}`;
    const scoreData = calculateStuckScore({
      stuckType: revised.stuckType,
      confidenceScore: revised.confidenceScore || 0.9,
      whatAlreadyTried: combinedNewText,
      fullProblemText: `${session.problemStatement?.whatTryingToDo} ${whatActuallyHappened}`,
    });

    // Update diagnosis with revised hypothesis
    session.diagnosis = {
      stuckType: revised.stuckType,
      confidenceScore: revised.confidenceScore || 0.9,
      stuckScore: scoreData.stuckScore,
      severityLevel: scoreData.severityLevel,
      rootCauseSummary: revised.rootCauseSummary,
      whyYouAreStuck: revised.whyYouAreStuck,
      keyMisconception: revised.keyMisconception,
    };

    // Update solution with revised action items & mental model
    session.solution = {
      mentalModelExplanation: revised.mentalModelExplanation,
      correctApproachOverview: revised.correctApproachOverview,
      antiPatternsToAvoid: revised.antiPatternsToAvoid || [],
      actionItems: (revised.actionItems || []).map((item, idx) => ({
        order: item.order || idx + 1,
        task: item.task,
        rationale: item.rationale,
        codeSnippet: item.codeSnippet || '',
        completed: false,
      })),
      verificationTest: revised.verificationTest,
    };

    if (revised.suggestedTags && Array.isArray(revised.suggestedTags)) {
      const mergedTags = new Set([...(session.tags || []), ...revised.suggestedTags]);
      session.tags = Array.from(mergedTags);
    }

    session.status = 'PLAN_READY';
    await session.save();

    recalculateUserPatterns(req.user._id).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Session re-diagnosed successfully with new empirical observations.',
      session,
      reEvaluationRationale: revised.reEvaluationRationale,
    });
  } catch (error) {
    next(error);
  }
};

