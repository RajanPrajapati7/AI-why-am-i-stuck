import mongoose from 'mongoose';

const blindspotSchema = new mongoose.Schema({
  category: { type: String, required: true },
  frequency: { type: Number, default: 1 },
  recommendation: { type: String, required: true },
  detectedAt: { type: Date, default: Date.now },
});

const userPatternSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalSessionsCount: { type: Number, default: 0 },
    resolvedSessionsCount: { type: Number, default: 0 },
    averageTimeToUnstuckMinutes: { type: Number, default: 0 },

    // Distribution of stuck types
    stuckTypeFrequencies: {
      SYNTAX_OR_RUNTIME_DEFECT: { type: Number, default: 0 },
      CONCEPTUAL_GAP: { type: Number, default: 0 },
      MENTAL_MODEL_DISTORTION: { type: Number, default: 0 },
      ENVIRONMENT_OR_CONFIG_DRIFT: { type: Number, default: 0 },
      ARCHITECTURAL_DEADLOCK: { type: Number, default: 0 },
      SCOPE_PARALYSIS: { type: Number, default: 0 },
      EDGE_CASE_BLINDSPOT: { type: Number, default: 0 },
    },

    // AI-identified repeated blindspots & recommendations
    identifiedBlindspots: [blindspotSchema],

    recurringTags: [
      {
        tag: { type: String },
        count: { type: Number, default: 1 },
      },
    ],

    lastAggregatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const UserPattern = mongoose.model('UserPattern', userPatternSchema);
