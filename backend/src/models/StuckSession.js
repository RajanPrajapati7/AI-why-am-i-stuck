import mongoose from 'mongoose';

const clarificationQuestionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  purpose: { type: String },
  suggestedOptions: [{ type: String }],
  userResponse: { type: String, default: '' },
  answeredAt: { type: Date },
});

const actionItemSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  task: { type: String, required: true },
  rationale: { type: String },
  codeSnippet: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const stuckSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'DIAGNOSING',
        'QUESTIONS_PENDING',
        'PLAN_READY',
        'IN_PROGRESS',
        'RESOLVED',
        'ABANDONED',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    domain: {
      type: String,
      enum: [
        'CODING_DEBUGGING',
        'ARCHITECTURE_DESIGN',
        'TOOLING_ENVIRONMENT',
        'CONCEPTUAL_LEARNING',
        'ALGORITHMS_LOGIC',
      ],
      required: true,
    },

    // Step 1: User's raw problem input
    problemStatement: {
      whatTryingToDo: { type: String, required: true },
      whatHappeningInstead: { type: String, required: true },
      whatAlreadyTried: { type: String, required: true },
      codeSnippetOrLogs: { type: String, default: '' },
      techStackContext: [{ type: String }],
    },

    // Step 2 & 3: Stuck Classification & Diagnosis
    diagnosis: {
      stuckType: {
        type: String,
        enum: [
          'SYNTAX_OR_RUNTIME_DEFECT',
          'CONCEPTUAL_GAP',
          'MENTAL_MODEL_DISTORTION',
          'ENVIRONMENT_OR_CONFIG_DRIFT',
          'ARCHITECTURAL_DEADLOCK',
          'SCOPE_PARALYSIS',
          'EDGE_CASE_BLINDSPOT',
        ],
      },
      confidenceScore: { type: Number, min: 0, max: 1 },
      stuckScore: { type: Number, min: 0, max: 100 },
      severityLevel: {
        type: String,
        enum: ['MILD_BLOCKER', 'MODERATE_IMPASSE', 'CRITICAL_DEADLOCK'],
      },
      rootCauseSummary: { type: String },
      whyYouAreStuck: { type: String },
      keyMisconception: { type: String },
    },

    // Step 4: Socratic / Clarification Questions
    clarificationQuestions: [clarificationQuestionSchema],

    // Step 5: Actionable Solution & Mental Model
    solution: {
      mentalModelExplanation: { type: String },
      correctApproachOverview: { type: String },
      antiPatternsToAvoid: [{ type: String }],
      actionItems: [actionItemSchema],
      verificationTest: { type: String },
    },

    // Step 6: Post-Mortem & Resolution
    resolution: {
      resolvedAt: { type: Date },
      timeToUnstuckMinutes: { type: Number },
      reflectionNotes: { type: String },
      whatActuallyFixedIt: { type: String },
      userHelpfulnessRating: { type: Number, min: 1, max: 5 },
    },

    // Re-diagnosis history: preserves previous hypotheses, action plans & new evidence
    revisions: [
      {
        revisedAt: { type: Date, default: Date.now },
        previousDiagnosis: {
          stuckType: String,
          stuckScore: Number,
          severityLevel: String,
          rootCauseSummary: String,
          whyYouAreStuck: String,
          keyMisconception: String,
        },
        previousSolution: {
          mentalModelExplanation: String,
          correctApproachOverview: String,
          actionItems: [actionItemSchema],
          verificationTest: String,
        },
        newObservations: {
          whatHappenedWhenTried: String,
          whatExpectedToHappen: String,
          whatActuallyHappened: String,
          newErrorOrLogs: String,
        },
        reEvaluationRationale: String,
      },
    ],

    tags: [{ type: String, index: true }],
  },
  {
    timestamps: true,
  }
);

// Compound index for user timeline queries
stuckSessionSchema.index({ userId: 1, createdAt: -1 });

export const StuckSession = mongoose.model('StuckSession', stuckSessionSchema);
