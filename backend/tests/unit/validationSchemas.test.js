import { describe, it, expect } from 'vitest';
import {
  createSessionSchema,
  submitAnswersSchema,
  resolveSessionSchema,
  rediagnoseSessionSchema,
} from '../../src/controllers/sessionController.js';
import {
  updateProfileSchema,
  updateSettingsSchema,
  registerSchema,
  loginSchema,
} from '../../src/controllers/authController.js';

describe('Zod Validation Schemas Unit Tests', () => {
  describe('createSessionSchema', () => {
    it('accepts valid session intake payload', () => {
      const validPayload = {
        domain: 'CODING_DEBUGGING',
        whatTryingToDo: 'Trying to fetch user data in useEffect',
        whatHappeningInstead: 'Getting infinite re-render loop on component mount',
        whatAlreadyTried: 'Added empty dependency array, memoized function',
        codeSnippetOrLogs: 'console.log("rendered")',
        techStackContext: ['React', 'JavaScript'],
      };

      const result = createSessionSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects invalid domain enum', () => {
      const invalidPayload = {
        domain: 'GRAPHIC_DESIGN_INVALID',
        whatTryingToDo: 'Trying to fetch user data',
        whatHappeningInstead: 'Loop occurs constantly',
        whatAlreadyTried: 'Tried adding dependencies',
      };

      const result = createSessionSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('domain');
    });

    it('rejects inputs that are too brief to diagnose', () => {
      const tooShortPayload = {
        domain: 'CODING_DEBUGGING',
        whatTryingToDo: 'help', // < 5 chars
        whatHappeningInstead: 'bad', // < 5 chars
        whatAlreadyTried: 'no', // < 3 chars
      };

      const result = createSessionSchema.safeParse(tooShortPayload);
      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('submitAnswersSchema', () => {
    it('accepts valid answered Socratic questions', () => {
      const validAnswers = {
        answers: [
          { questionId: 'q1', responseText: 'The hook is triggered when props change.' },
          { questionId: 'q2', responseText: 'I verified the network tab has no requests.' },
        ],
      };

      const result = submitAnswersSchema.safeParse(validAnswers);
      expect(result.success).toBe(true);
    });

    it('rejects answers with empty responseText', () => {
      const emptyAnswer = {
        answers: [{ questionId: 'q1', responseText: '' }],
      };

      const result = submitAnswersSchema.safeParse(emptyAnswer);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain('Response cannot be empty');
    });
  });

  describe('resolveSessionSchema', () => {
    it('accepts valid post-mortem resolution payload', () => {
      const validResolution = {
        whatActuallyFixedIt: 'Extracted object creation outside the useEffect callback.',
        reflectionNotes: 'Always verify object reference stability in React deps.',
        userHelpfulnessRating: 5,
      };

      const result = resolveSessionSchema.safeParse(validResolution);
      expect(result.success).toBe(true);
    });

    it('rejects ratings outside 1 to 5', () => {
      const invalidRating = {
        whatActuallyFixedIt: 'Fixed the dependency reference',
        userHelpfulnessRating: 10,
      };

      const result = resolveSessionSchema.safeParse(invalidRating);
      expect(result.success).toBe(false);
    });
  });

  describe('rediagnoseSessionSchema', () => {
    it('accepts valid empirical re-diagnosis observation payload', () => {
      const validObservation = {
        whatHappenedWhenTried: 'Added CORS headers on backend server',
        whatExpectedToHappen: 'Request should succeed with 200 OK',
        whatActuallyHappened: 'Still failing with 401 Unauthorized token missing',
        newErrorOrLogs: 'Error: Credentials flag not set on axios client',
      };

      const result = rediagnoseSessionSchema.safeParse(validObservation);
      expect(result.success).toBe(true);
    });

    it('rejects payloads missing mandatory observation fields', () => {
      const missingPayload = {
        whatHappenedWhenTried: 'Tried it',
        // missing whatExpectedToHappen and whatActuallyHappened
      };

      const result = rediagnoseSessionSchema.safeParse(missingPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('accepts valid profile update fields', () => {
      const validProfile = {
        name: 'Ada Lovelace Lead',
        experienceLevel: 'ADVANCED',
        primaryTechStack: ['TypeScript', 'Rust', 'Docker'],
      };

      const result = updateProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('rejects invalid experience level enum', () => {
      const invalidProfile = {
        experienceLevel: 'EXPERT_NINJA_INVALID',
      };

      const result = updateProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toContain('experienceLevel');
    });

    it('rejects names shorter than 2 characters', () => {
      const invalidName = {
        name: 'A',
      };

      const result = updateProfileSchema.safeParse(invalidName);
      expect(result.success).toBe(false);
    });
  });

  describe('updateSettingsSchema', () => {
    it('accepts valid appearance and AI preferences', () => {
      const validSettings = {
        appearance: 'system',
        aiPreferences: {
          enableCognitiveCoaching: false,
          enableSocraticQuestioning: true,
        },
      };

      const result = updateSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
    });

    it('rejects invalid appearance enum', () => {
      const invalidSettings = {
        appearance: 'neon_pink_invalid',
      };

      const result = updateSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema & loginSchema', () => {
    it('validates proper email format in register and login', () => {
      expect(registerSchema.safeParse({ name: 'Bob', email: 'not-an-email', password: '123456' }).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'not-an-email', password: '123' }).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'valid@test.com', password: '123' }).success).toBe(true);
    });

    it('rejects registration passwords shorter than 6 characters', () => {
      expect(registerSchema.safeParse({ name: 'Bob', email: 'bob@test.com', password: '123' }).success).toBe(false);
    });
  });
});
