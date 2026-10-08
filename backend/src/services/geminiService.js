import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Initialize Gemini Client
const getGeminiModel = () => {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.startsWith('replace_with')) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  // Default to fast, reliable model
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });
};

// Safe error categorization and structured logging helper (guarantees secrets are never logged)
const handleGeminiError = (operation, error) => {
  const isQuota =
    error.status === 429 ||
    error.message?.includes('429') ||
    error.message?.includes('RESOURCE_EXHAUSTED') ||
    error.message?.includes('quota');

  const isNetwork =
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT' ||
    error.message?.includes('fetch failed') ||
    error.message?.includes('network');

  logger.warn(
    {
      operation,
      isQuota,
      isNetwork,
      status: error.status,
      errorSummary: isQuota
        ? 'Google Gemini quota exceeded (429 RESOURCE_EXHAUSTED). Falling back to built-in Cognitive Heuristic Engine.'
        : isNetwork
        ? 'Google Gemini network/timeout failure. Falling back to built-in Cognitive Heuristic Engine.'
        : `Gemini API execution error (${error.name || 'APIError'}). Falling back to built-in Cognitive Heuristic Engine.`,
    },
    `[Gemini AI ${operation}] Fallback activated: ${isQuota ? 'Quota Exceeded' : isNetwork ? 'Network Timeout' : 'API Error'}`
  );
};

// Safe JSON extraction helper
const extractJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    // If wrapped in markdown ```json ... ```
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw new Error('Failed to parse AI JSON response: ' + text.slice(0, 200));
  }
};

/**
 * STAGE 1: Problem Analysis, Taxonomy Classification, and Targeted Socratic Questions
 */
export const diagnoseProblemAI = async ({
  problemStatement,
  domain,
  experienceLevel = 'INTERMEDIATE',
}) => {
  const model = getGeminiModel();

  if (!model) {
    logger.debug('[AI Engine] No Gemini API key configured. Using built-in Cognitive Heuristic Engine.');
    return cognitiveHeuristicDiagnosis({ problemStatement, domain, experienceLevel });
  }

  const prompt = `
You are the "AI Why Am I Stuck Assistant" — a Senior Staff Cognitive Debugging Architect.
Your mandate is NOT to behave like a generic conversational chatbot or blindly hand out code fixes.
Your purpose is to diagnose WHY the user is stuck (cognitive blindspot, XY problem, conceptual misunderstanding, environment drift, etc.), isolate the core misconception, and formulate 1 to 3 targeted clarification questions to probe their assumptions.

Domain: ${domain}
User Experience Level: ${experienceLevel}
User Tech Stack: ${(problemStatement.techStackContext || []).join(', ') || 'General'}

User Problem Details:
- What they are trying to do:
"""${problemStatement.whatTryingToDo}"""

- What is happening instead:
"""${problemStatement.whatHappeningInstead}"""

- What they have already tried:
"""${problemStatement.whatAlreadyTried}"""

- Code Snippet or Error Logs:
"""${problemStatement.codeSnippetOrLogs || 'None provided'}"""

STUCK TAXONOMY (You must pick exactly one from this list):
1. "SYNTAX_OR_RUNTIME_DEFECT" - Concrete syntax error, unhandled exception, type error, or null dereference.
2. "CONCEPTUAL_GAP" - Missing knowledge of how a specific library, protocol, lifecycle, or algorithm works.
3. "MENTAL_MODEL_DISTORTION" - The user has a flawed mental model (e.g. thinking async code executes synchronously, mutating state directly, assuming client runs in server context).
4. "ENVIRONMENT_OR_CONFIG_DRIFT" - Build tool mismatches, CORS, port collisions, missing environment variables, version incompatibility.
5. "ARCHITECTURAL_DEADLOCK" - Coupling issues, circular dependencies, circular state updates, or bad component hierarchy.
6. "SCOPE_PARALYSIS" - Trying to solve too many things at once without atomic decomposition.
7. "EDGE_CASE_BLINDSPOT" - Unhandled edge case, race condition, data boundary condition, or timing issue.

Respond strictly in valid JSON matching this schema:
{
  "stuckType": "ONE_OF_THE_7_ENUMS_ABOVE",
  "confidenceScore": 0.95,
  "rootCauseSummary": "Concise 1-2 sentence statement of the core mechanical/logical obstacle",
  "whyYouAreStuck": "Clear, empathetic explanation of the cognitive blocker or misconception",
  "keyMisconception": "The exact implicit assumption the user is making that is incorrect",
  "clarificationQuestions": [
    {
      "questionId": "q1",
      "questionText": "Direct, probing question targeting their assumption",
      "purpose": "Why answering this reveals the exact failure point",
      "suggestedOptions": ["Option A", "Option B", "Option C"]
    }
  ],
  "suggestedTags": ["tag1", "tag2", "tag3"]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return extractJSON(text);
  } catch (error) {
    handleGeminiError('diagnoseProblemAI', error);
    // Fall back to heuristic engine if API fails
    return cognitiveHeuristicDiagnosis({ problemStatement, domain, experienceLevel });
  }
};

/**
 * STAGE 2: Personalized Solution, Mental Model Demystification, and Action Plan
 */
export const generateSolutionAI = async ({
  problemStatement,
  diagnosis,
  clarificationQuestions,
}) => {
  const model = getGeminiModel();

  if (!model) {
    console.log('[AI Engine] Using built-in Cognitive Solution Builder.');
    return cognitiveHeuristicSolution({ problemStatement, diagnosis, clarificationQuestions });
  }

  const prompt = `
You are the "AI Why Am I Stuck Assistant".
You have previously diagnosed the user's problem. Now, based on their answers to your targeted questions, produce a structured, actionable resolution plan.

Diagnosis Context:
- Stuck Type: ${diagnosis.stuckType}
- Root Cause: ${diagnosis.rootCauseSummary}
- Key Misconception: ${diagnosis.keyMisconception}

Original Problem:
- Goal: """${problemStatement.whatTryingToDo}"""
- Blocker: """${problemStatement.whatHappeningInstead}"""
- Code/Logs: """${problemStatement.codeSnippetOrLogs || 'None'}"""

Targeted Question Q&A:
${clarificationQuestions
  .map(
    (q, i) => `Q${i + 1}: ${q.questionText}
User's Answer: "${q.userResponse || 'No answer provided'}"`
  )
  .join('\n\n')}

REQUIREMENTS:
1. Explain the correct Mental Model in plain, illuminating terms.
2. Outline the correct approach.
3. List 2-3 anti-patterns to avoid.
4. Produce 3 to 5 atomic, step-by-step Action Items with actionable tasks, rationale, and specific minimal code snippets where helpful.
5. Provide 1 concrete Verification Test to prove the issue is resolved.

Respond strictly in valid JSON matching this schema:
{
  "mentalModelExplanation": "Thorough yet concise explanation of how the mechanism actually works",
  "correctApproachOverview": "High-level strategy to solve this cleanly",
  "antiPatternsToAvoid": [
    "Anti-pattern 1",
    "Anti-pattern 2"
  ],
  "actionItems": [
    {
      "order": 1,
      "task": "Specific atomic action item title",
      "rationale": "Why this step is necessary",
      "codeSnippet": "// optional code snippet if relevant, or empty string"
    }
  ],
  "verificationTest": "Exact command, test case, or observation to verify you are truly unstuck"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return extractJSON(text);
  } catch (error) {
    handleGeminiError('generateSolutionAI', error);
    return cognitiveHeuristicSolution({ problemStatement, diagnosis, clarificationQuestions });
  }
};

/**
 * RE-DIAGNOSIS ENGINE: Re-evaluates hypothesis with new empirical evidence when user is still stuck
 */
export const rediagnoseProblemAI = async ({
  problemStatement,
  previousDiagnosis,
  clarificationQuestions,
  previousSolution,
  attemptedActionItems = [],
  newObservations,
  domain,
  experienceLevel = 'INTERMEDIATE',
}) => {
  const model = getGeminiModel();

  if (!model) {
    console.log('[AI Engine] Using built-in Cognitive Re-Diagnosis Builder.');
    return cognitiveHeuristicRediagnosis({
      problemStatement,
      previousDiagnosis,
      attemptedActionItems,
      newObservations,
      domain,
      experienceLevel,
    });
  }

  const prompt = `
You are the "AI Why Am I Stuck Assistant" — a Senior Staff Cognitive Debugging Architect.
The user previously diagnosed a technical blocker, attempted the recommended action steps, but reports that they are STILL STUCK.
Your mandate is: DO NOT BLINDLY ASSUME THE PREVIOUS DIAGNOSIS WAS CORRECT.
You must re-evaluate the hypothesis using the new evidence and empirical observations the user just provided.

Domain: ${domain}
Experience Level: ${experienceLevel}
Tech Stack: ${(problemStatement.techStackContext || []).join(', ') || 'General'}

Original Problem:
- Goal: """${problemStatement.whatTryingToDo}"""
- Initial Blocker: """${problemStatement.whatHappeningInstead}"""
- Initial Code/Logs: """${problemStatement.codeSnippetOrLogs || 'None'}"""

Previous Hypotheses & Action Plan:
- Previous Stuck Type: ${previousDiagnosis.stuckType}
- Previous Root Cause: ${previousDiagnosis.rootCauseSummary}
- Previous Key Misconception: ${previousDiagnosis.keyMisconception}
- Action Items Attempted by User:
${attemptedActionItems.map((a) => `- [X] ${a.task} (Rationale: ${a.rationale})`).join('\n') || 'None checked'}

NEW EMPIRICAL EVIDENCE & OBSERVATIONS (CRITICAL):
- What happened when they tried the steps: """${newObservations.whatHappenedWhenTried}"""
- What they expected to happen: """${newObservations.whatExpectedToHappen}"""
- What actually happened instead: """${newObservations.whatActuallyHappened}"""
- New Error Logs / Output: """${newObservations.newErrorOrLogs || 'None provided'}"""

TAXONOMY OPTIONS:
1. "SYNTAX_OR_RUNTIME_DEFECT"
2. "CONCEPTUAL_GAP"
3. "MENTAL_MODEL_DISTORTION"
4. "ENVIRONMENT_OR_CONFIG_DRIFT"
5. "ARCHITECTURAL_DEADLOCK"
6. "SCOPE_PARALYSIS"
7. "EDGE_CASE_BLINDSPOT"

RE-EVALUATION INSTRUCTIONS:
1. Challenge the previous hypothesis: Did the attempted fix reveal a secondary hidden layer, an environment assumption, or a deeper lifecycle issue?
2. Update or pivot the stuckType if the new observations point to another failure mode.
3. Provide a clear reEvaluationRationale explaining what the failed attempt revealed.
4. Provide a refined Mental Model and 2-4 fresh, atomic Action Items with code snippets.
5. Provide a concrete Verification Test.

Respond strictly in valid JSON matching this schema:
{
  "stuckType": "ONE_OF_THE_7_ENUMS_ABOVE",
  "confidenceScore": 0.95,
  "rootCauseSummary": "Concise 1-2 sentence statement of the newly isolated root obstacle",
  "whyYouAreStuck": "Updated, empathetic explanation of the cognitive blocker in light of the new evidence",
  "keyMisconception": "The revised misconception revealed by the failed attempt",
  "reEvaluationRationale": "Explanation of what the failed attempt proved and why this revised direction is required",
  "stuckTypeChanged": true,
  "mentalModelExplanation": "Thorough yet concise revised explanation of how the mechanism actually operates",
  "correctApproachOverview": "High-level strategy to solve this second-layer blocker",
  "antiPatternsToAvoid": [
    "Anti-pattern 1",
    "Anti-pattern 2"
  ],
  "actionItems": [
    {
      "order": 1,
      "task": "Specific atomic action item",
      "rationale": "Why this revised step addresses the empirical failure",
      "codeSnippet": "// optional code snippet or empty string"
    }
  ],
  "verificationTest": "Exact verification step to prove the revised plan worked",
  "suggestedTags": ["tag1", "tag2"]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return extractJSON(text);
  } catch (error) {
    handleGeminiError('rediagnoseProblemAI', error);
    return cognitiveHeuristicRediagnosis({
      problemStatement,
      previousDiagnosis,
      attemptedActionItems,
      newObservations,
      domain,
      experienceLevel,
    });
  }
};

/**
 * STAGE 3: Long-term Learning Pattern Synthesis
 */
export const synthesizeLearningPatternsAI = async ({ sessionsSummary }) => {
  const model = getGeminiModel();

  if (!model || sessionsSummary.length === 0) {
    return cognitiveHeuristicPatterns(sessionsSummary);
  }

  const prompt = `
You are an expert Engineering Meta-Learning Coach.
Analyze the following historical stuck sessions for a developer and detect recurring cognitive patterns, recurring blindspots, and systemic habits.

Sessions Summary:
${JSON.stringify(sessionsSummary, null, 2)}

Respond strictly in valid JSON matching this schema:
{
  "identifiedBlindspots": [
    {
      "category": "e.g. Asynchronous State Race Conditions",
      "frequency": 3,
      "recommendation": "Concrete actionable study recommendation to overcome this recurrent blindspot"
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return extractJSON(text);
  } catch (error) {
    handleGeminiError('synthesizeLearningPatternsAI', error);
    return cognitiveHeuristicPatterns(sessionsSummary);
  }
};

/* ==========================================================================
   COGNITIVE HEURISTIC ENGINE (Intelligent Fallback / Offline / Demo Mode)
   Enables 100% reliable, immediate local operation with domain-aware logic.
   ========================================================================== */

function cognitiveHeuristicDiagnosis({ problemStatement, domain, experienceLevel }) {
  const combinedText = `
    ${problemStatement.whatTryingToDo} 
    ${problemStatement.whatHappeningInstead} 
    ${problemStatement.whatAlreadyTried} 
    ${problemStatement.codeSnippetOrLogs}
  `.toLowerCase();

  let stuckType = 'CONCEPTUAL_GAP';
  let rootCauseSummary = 'There is a mismatch between the expected execution flow and the underlying runtime semantics.';
  let whyYouAreStuck = 'You are treating the problem as a local bug rather than examining the underlying lifecycle and data contract.';
  let keyMisconception = 'Assuming state or resources update synchronously when they are managed asynchronously.';
  let clarificationQuestions = [];
  let suggestedTags = ['debugging', 'troubleshooting'];

  if (
    combinedText.includes('cors') ||
    combinedText.includes('port') ||
    combinedText.includes('env') ||
    combinedText.includes('cannot find module') ||
    combinedText.includes('eaddrinuse')
  ) {
    stuckType = 'ENVIRONMENT_OR_CONFIG_DRIFT';
    rootCauseSummary = 'A configuration mismatch, missing environment variable, or cross-origin policy barrier is blocking communication.';
    whyYouAreStuck = 'The code logic may be sound, but the surrounding runtime environment (ports, origin headers, or credentials) does not meet required network contracts.';
    keyMisconception = 'Assuming client and server can communicate without explicit cross-origin credentials and headers.';
    clarificationQuestions = [
      {
        questionId: 'q1',
        questionText: 'Are client requests being sent with `credentials: true` / `include` while the server origin is explicitly whitelisted?',
        purpose: 'Isolates whether credentials or wildcard origin policies are failing.',
        suggestedOptions: ['Yes, origin is explicitly whitelisted', 'I am using origin: * with cookies', 'Not sure of the exact header']
      },
      {
        questionId: 'q2',
        questionText: 'Have you verified that the environment variables are loaded before the database or server initializes?',
        purpose: 'Checks if initialization order is causing undefined connection strings.',
        suggestedOptions: ['dotenv is called at top of entry file', 'dotenv might be loaded later', 'Hardcoded values are used']
      }
    ];
    suggestedTags = ['environment', 'configuration', 'network', 'cors'];
  } else if (
    combinedText.includes('infinite loop') ||
    combinedText.includes('maximum update depth') ||
    combinedText.includes('useeffect') ||
    combinedText.includes('re-render') ||
    combinedText.includes('state')
  ) {
    stuckType = 'MENTAL_MODEL_DISTORTION';
    rootCauseSummary = 'State mutation inside an effect or handler triggers an unconstrained reactive re-render loop.';
    whyYouAreStuck = 'You are assuming the hook only triggers on external user interaction, but dependency reference changes trigger it every render cycle.';
    keyMisconception = 'Creating new object/array references inside render that are passed to dependency arrays, defeating memoization.';
    clarificationQuestions = [
      {
        questionId: 'q1',
        questionText: 'Is the state updater function `setState(...)` being invoked directly inside a `useEffect` without a guard condition or dependency check?',
        purpose: 'Pinpoints whether the effect triggers its own trigger.',
        suggestedOptions: ['Yes, setState is called inside useEffect', 'No, it is inside an event handler', 'It is inside a Promise callback in useEffect']
      },
      {
        questionId: 'q2',
        questionText: 'Are the dependencies in the dependency array primitives (strings, numbers) or objects/functions created anew each render?',
        purpose: 'Determines if referential inequality is causing unnecessary effect runs.',
        suggestedOptions: ['Primitives only', 'Inline objects or functions', 'Empty array []']
      }
    ];
    suggestedTags = ['react', 'state-management', 'hooks', 'lifecycle'];
  } else if (
    combinedText.includes('undefined') ||
    combinedText.includes('null') ||
    combinedText.includes('typeerror') ||
    combinedText.includes('cannot read properties of undefined')
  ) {
    stuckType = 'SYNTAX_OR_RUNTIME_DEFECT';
    rootCauseSummary = 'Attempting to access a property or execute a method on an unresolved or asynchronous object.';
    whyYouAreStuck = 'The code accesses data before an asynchronous operation (API call, query, or file read) has populated the variable.';
    keyMisconception = 'Assuming the data is synchronously available immediately on component mount or function invocation.';
    clarificationQuestions = [
      {
        questionId: 'q1',
        questionText: 'Is the object accessed during initial render before the asynchronous fetch/promise completes?',
        purpose: 'Distinguishes between missing data structure vs asynchronous delay.',
        suggestedOptions: ['Yes, before fetch finishes', 'No, fetch has already resolved', 'Data comes from route params or props']
      },
      {
        questionId: 'q2',
        questionText: 'Have you verified the exact payload shape using `console.log` or debugger at the call site?',
        purpose: 'Verifies whether backend schema matches frontend expectations.',
        suggestedOptions: ['Verified payload matches', 'The payload might be wrapped in { data: ... }', 'Have not logged it yet']
      }
    ];
    suggestedTags = ['runtime-error', 'null-safety', 'async-data'];
  } else if (
    combinedText.includes('how to structure') ||
    combinedText.includes('architecture') ||
    combinedText.includes('too complex') ||
    combinedText.includes('don\'t know where to start') ||
    combinedText.includes('overwhelmed')
  ) {
    stuckType = 'SCOPE_PARALYSIS';
    rootCauseSummary = 'Too many interdependent requirements are being addressed at the same time without clear boundary separation.';
    whyYouAreStuck = 'You are trying to design the optimal final state upfront rather than implementing a minimal verifiable vertical slice.';
    keyMisconception = 'Believing you must architect the entire system before proving the core interaction loop.';
    clarificationQuestions = [
      {
        questionId: 'q1',
        questionText: 'What is the absolute smallest single user action that proves the core concept works end-to-end?',
        purpose: 'Forces scoping down to an atomic vertical slice.',
        suggestedOptions: ['A single API endpoint + UI button', 'The whole CRUD pipeline', 'Authentication + database']
      }
    ];
    suggestedTags = ['architecture', 'scope', 'system-design'];
  } else {
    clarificationQuestions = [
      {
        questionId: 'q1',
        questionText: 'What was the exact last change made right before this behavior started occurring?',
        purpose: 'Isolates the delta that introduced the deviation.',
        suggestedOptions: ['Added a new dependency or route', 'Refactored existing function', 'Changed data schema', 'Unknown']
      },
      {
        questionId: 'q2',
        questionText: 'Can you reproduce this issue in isolation with hardcoded dummy data?',
        purpose: 'Separates environment/network issues from core algorithmic logic.',
        suggestedOptions: ['Yes, fails with dummy data too', 'No, only fails in integration', 'Have not tested with dummy data']
      }
    ];
    suggestedTags = ['problem-solving', 'logic', 'root-cause'];
  }

  return {
    stuckType,
    confidenceScore: 0.9,
    rootCauseSummary,
    whyYouAreStuck,
    keyMisconception,
    clarificationQuestions,
    suggestedTags,
  };
}

function cognitiveHeuristicSolution({ problemStatement, diagnosis, clarificationQuestions }) {
  const stuckType = diagnosis.stuckType || 'CONCEPTUAL_GAP';

  let mentalModel = 'In modern distributed & reactive web applications, systems operate as state-driven pipelines. A failure indicates an unhandled intermediate state or a broken invariant.';
  let correctApproach = 'Decompose the flow into 3 verified checkpoints: 1) Input validation, 2) State transition, 3) Observer/View synchronization.';
  let antiPatterns = [
    'Patching symptoms with arbitrary timeouts (setTimeout) instead of awaiting promises.',
    'Overwriting state directly without using immutable setters or transactional commits.',
    'Copying StackOverflow solutions without understanding the underlying protocol requirements.'
  ];

  let actionItems = [
    {
      order: 1,
      task: 'Isolate the failing invariant with an explicit log or breakpoint',
      rationale: 'Confirm the actual runtime value before the failure point to verify our hypothesis.',
      codeSnippet: `console.log('[DEBUG Checkpoint]', { input: stateOrPayload, timestamp: Date.now() });`
    },
    {
      order: 2,
      task: 'Apply safe optional chaining and fallback defaults',
      rationale: 'Ensure the runtime never encounters an unhandled undefined/null state during async resolution.',
      codeSnippet: `const safeData = response?.data ?? [];`
    },
    {
      order: 3,
      task: 'Restructure the execution order to enforce deterministic completion',
      rationale: 'Guarantees that prerequisites resolve before dependent logic executes.',
      codeSnippet: `// Await dependency before state update\nconst result = await serviceCall();\nsetState(result);`
    }
  ];

  let verificationTest = 'Run the execution flow with clean cache/fresh state and verify no unhandled rejection or infinite re-render warning appears in the console.';

  if (stuckType === 'ENVIRONMENT_OR_CONFIG_DRIFT') {
    mentalModel = 'Browsers enforce Same-Origin Policy (SOP). Cross-origin requests with cookies/credentials require explicit origin reflection and `Access-Control-Allow-Credentials: true`. Wildcards (*) are forbidden when credentials are sent.';
    correctApproach = 'Configure CORS middleware with an exact origin match (`process.env.CLIENT_URL`) and ensure axios/fetch has `withCredentials: true`.';
    antiPatterns = [
      'Using `cors({ origin: "*" })` while sending cookies (browser will reject response).',
      'Configuring CORS on the client instead of the server.'
    ];
    actionItems = [
      {
        order: 1,
        task: 'Configure server-side CORS with explicit client origin and credentials',
        rationale: 'Satisfies browser security constraints for HTTP-only cookie exchange.',
        codeSnippet: `app.use(cors({\n  origin: process.env.CLIENT_URL || 'http://localhost:5173',\n  credentials: true\n}));`
      },
      {
        order: 2,
        task: 'Enable credentials in frontend HTTP client configuration',
        rationale: 'Instructs browser to attach cookies to cross-origin requests.',
        codeSnippet: `axios.defaults.withCredentials = true;`
      }
    ];
    verificationTest = 'Inspect Network tab: Verify response headers include `Access-Control-Allow-Origin: http://localhost:5173` and `Access-Control-Allow-Credentials: true`.';
  } else if (stuckType === 'MENTAL_MODEL_DISTORTION') {
    mentalModel = 'React renders top-to-bottom. If an effect triggers a state change that causes the component to re-render and re-create a reference in the effect dependency array, an infinite loop is born.';
    correctApproach = 'Use functional state updates, extract non-reactive references outside the component, or memoize with `useCallback`/`useMemo`.';
    antiPatterns = [
      'Omitting dependencies from the dependency array without fixing the root cause.',
      'Instantiating new objects/functions inside the render body and passing them to useEffect dependencies.'
    ];
    actionItems = [
      {
        order: 1,
        task: 'Switch to functional state updates where possible',
        rationale: 'Removes the current state variable from the effect dependency array.',
        codeSnippet: `// Instead of setState(count + 1):\nsetState(prev => prev + 1);`
      },
      {
        order: 2,
        task: 'Guard the effect execution with an invariant check',
        rationale: 'Stops repeated execution when the desired state has already been reached.',
        codeSnippet: `useEffect(() => {\n  if (!dataLoaded) {\n    loadData();\n  }\n}, [dataLoaded]);`
      }
    ];
    verificationTest = 'Place a single `console.log("Render count")` in the component body. Verify it renders at most 2 times on mount, not continuously.';
  }

  return {
    mentalModelExplanation: mentalModel,
    correctApproachOverview: correctApproach,
    antiPatternsToAvoid: antiPatterns,
    actionItems,
    verificationTest,
  };
}

function cognitiveHeuristicPatterns(sessionsSummary) {
  const typeCounts = {};
  sessionsSummary.forEach((s) => {
    const t = s.stuckType || 'CONCEPTUAL_GAP';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  const identifiedBlindspots = [];

  if ((typeCounts['MENTAL_MODEL_DISTORTION'] || 0) >= 1) {
    identifiedBlindspots.push({
      category: 'Reactive Lifecycle & State Management Loop Blindspot',
      frequency: typeCounts['MENTAL_MODEL_DISTORTION'] || 1,
      recommendation: 'Deep-dive into component render cycles and referential equality. Practice building components using functional state updaters and custom hooks.',
    });
  }

  if ((typeCounts['ENVIRONMENT_OR_CONFIG_DRIFT'] || 0) >= 1) {
    identifiedBlindspots.push({
      category: 'Cross-Origin Security & Environment Drift',
      frequency: typeCounts['ENVIRONMENT_OR_CONFIG_DRIFT'] || 1,
      recommendation: 'Review CORS pre-flight OPTION requests, cookie SameSite attributes, and establish a single source of truth for environment variables.',
    });
  }

  if (identifiedBlindspots.length === 0) {
    identifiedBlindspots.push({
      category: 'Systematic Debugging & Atomic Decomposition',
      frequency: 1,
      recommendation: 'Adopt a hypothesis-first debugging process. Formulate an explicit assumption before modifying code, and verify with a minimal test case.',
    });
  }

  return { identifiedBlindspots };
}

function cognitiveHeuristicRediagnosis({
  problemStatement,
  previousDiagnosis,
  attemptedActionItems,
  newObservations,
  domain,
  experienceLevel,
}) {
  const combinedNewText = `
    ${newObservations.whatHappenedWhenTried || ''}
    ${newObservations.whatActuallyHappened || ''}
    ${newObservations.newErrorOrLogs || ''}
  `.toLowerCase();

  let stuckType = previousDiagnosis.stuckType || 'CONCEPTUAL_GAP';
  let stuckTypeChanged = false;
  let reEvaluationRationale =
    'The initial hypothesis assumed a primary failure at the invocation site, but the empirical results from your attempted steps reveal a secondary invariant violation.';
  let rootCauseSummary = `Revised: ${previousDiagnosis.rootCauseSummary || 'Underlying configuration and lifecycle conflict'}`;
  let whyYouAreStuck =
    'You applied the direct fix, but the system possesses an unhandled side-effect or environment constraint that is masking the real invariant.';
  let keyMisconception =
    'Assuming the symptom was localized to the immediate function without validating downstream side-effects.';

  // Check if new evidence reveals a different stuck type
  if (
    combinedNewText.includes('cors') ||
    combinedNewText.includes('network') ||
    combinedNewText.includes('port') ||
    combinedNewText.includes('econnrefused') ||
    combinedNewText.includes('403') ||
    combinedNewText.includes('401')
  ) {
    if (stuckType !== 'ENVIRONMENT_OR_CONFIG_DRIFT') {
      stuckType = 'ENVIRONMENT_OR_CONFIG_DRIFT';
      stuckTypeChanged = true;
      reEvaluationRationale =
        'The new observation demonstrates that while application logic was refactored, the browser or network environment is rejecting the request at the protocol/origin layer.';
    }
    rootCauseSummary =
      'Network security boundary or proxy configuration is silently rejecting cross-origin requests or missing auth headers.';
    whyYouAreStuck =
      'The code logic is no longer the issue; you are blocked by runtime network policies (CORS origin mapping or cookie transport credentials).';
    keyMisconception =
      'Assuming that fixing application state resolves network protocol rejection.';
  } else if (
    combinedNewText.includes('undefined') ||
    combinedNewText.includes('null') ||
    combinedNewText.includes('cannot read') ||
    combinedNewText.includes('typeerror')
  ) {
    if (stuckType !== 'SYNTAX_OR_RUNTIME_DEFECT') {
      stuckType = 'SYNTAX_OR_RUNTIME_DEFECT';
      stuckTypeChanged = true;
      reEvaluationRationale =
        'Your attempted change unmasked a runtime null-pointer dereference that occurs during initial render or asynchronous state hydration.';
    }
    rootCauseSummary =
      'Asynchronous data is accessed synchronously before the state container is hydrated.';
    whyYouAreStuck =
      'The previous fix altered the timing of execution, exposing that downstream consumers expect the object to be defined synchronously.';
    keyMisconception =
      'Assuming state containers have synchronous initial values across all render passes.';
  } else if (
    combinedNewText.includes('race') ||
    combinedNewText.includes('stale') ||
    combinedNewText.includes('intermittent') ||
    combinedNewText.includes('timing')
  ) {
    if (stuckType !== 'EDGE_CASE_BLINDSPOT') {
      stuckType = 'EDGE_CASE_BLINDSPOT';
      stuckTypeChanged = true;
      reEvaluationRationale =
        'The intermittent failure mode points to an unhandled asynchronous race condition rather than a deterministic logic error.';
    }
    rootCauseSummary =
      'Concurrent operations resolve out of order, overwriting current state with stale resolution data.';
    whyYouAreStuck =
      'You are relying on sequential line execution order for operations that complete unpredictably in the microtask queue.';
    keyMisconception =
      'Assuming the first asynchronous request initiated is guaranteed to be the first to resolve and write.';
  } else {
    // Retain stuck type but deepen analysis
    reEvaluationRationale =
      'The previous steps confirmed the domain category, but isolated an unhandled lifecycle edge condition that requires an explicit abort/cleanup guard.';
    rootCauseSummary = `Deepened Diagnosis: Persistent lifecycle deadlock due to unmemoized callbacks or missing cleanup cycle.`;
    whyYouAreStuck =
      'The first action plan addressed the primary symptom, but left an active observer or dependency un-cleaned between execution cycles.';
    keyMisconception =
      'Assuming that applying a functional state update alone neutralizes unhandled asynchronous subscriptions.';
  }

  const actionItems = [
    {
      order: 1,
      task: 'Instrument an execution tracer with active state payload logging',
      rationale:
        'Verify the exact state delta at the moment the new observation occurs.',
      codeSnippet: `console.log('[Re-diagnosis Inspection]', {\n  timestamp: new Date().toISOString(),\n  evidence: ${JSON.stringify(newObservations.whatActuallyHappened || 'trace')}\n});`,
    },
    {
      order: 2,
      task: 'Enforce strict lifecycle boundary with boolean hydration guard or abort controller',
      rationale:
        'Prevents downstream consumers from executing until the invariant is completely established.',
      codeSnippet: `let isMounted = true;\n// Guard execution inside async callback\nif (isMounted) {\n  applyResolvedState();\n}\nreturn () => { isMounted = false; };`,
    },
    {
      order: 3,
      task: 'Re-run isolated unit check without surrounding side-effects',
      rationale:
        'Confirms the second-layer blocker is resolved independently of broader application state.',
      codeSnippet: `// Run targeted verification script or command`,
    },
  ];

  return {
    stuckType,
    confidenceScore: 0.93,
    rootCauseSummary,
    whyYouAreStuck,
    keyMisconception,
    reEvaluationRationale,
    stuckTypeChanged,
    mentalModelExplanation:
      'In multi-stage cognitive debugging, the first step often peels away the outer symptom (e.g. infinite loop), exposing the real structural invariant beneath (e.g. data hydration timing or network origin rejection). Treat this failure as critical diagnostic data.',
    correctApproachOverview:
      'Implement an explicit defensive lifecycle guard and verify data contract boundaries before re-triggering execution.',
    antiPatternsToAvoid: [
      'Assuming the previous action plan was completely wrong instead of recognizing it exposed a deeper dependency.',
      'Adding random setTimeout delays to bypass lifecycle timing.',
    ],
    actionItems,
    verificationTest:
      'Execute the exact sequence that triggered the new observation and confirm zero errors in console and network inspector.',
    suggestedTags: ['re-diagnosis', 'root-cause-deepened', 'lifecycle-guard'],
  };
}

