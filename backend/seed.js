import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { StuckSession } from './src/models/StuckSession.js';
import { UserPattern } from './src/models/UserPattern.js';
import { recalculateUserPatterns } from './src/services/analyticsService.js';

dotenv.config();

async function seedData() {
  // Production safety guard: prevent accidental deletion or overwriting of production data
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    console.error('\n[PRODUCTION SAFETY GUARD] Database seeding is blocked in production mode.');
    console.error('To force seed in production, explicitly set ALLOW_PRODUCTION_SEED=true.\n');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/why_am_i_stuck_db');
  console.log('[Seed] Connected to MongoDB');

  // Clean demo user
  const email = 'developer@antigravity.ai';
  await User.deleteOne({ email });

  const user = await User.create({
    name: 'Alex Rivera',
    email,
    passwordHash: 'cognitive1234',
    experienceLevel: 'INTERMEDIATE',
    primaryTechStack: ['React', 'Node.js', 'MongoDB', 'Vite', 'Express'],
  });

  console.log('[Seed] Created Demo User:', user.email);

  // Clear previous sessions for demo user
  await StuckSession.deleteMany({ userId: user._id });

  // 1. Resolved session 1: CORS & Credentials
  const s1 = await StuckSession.create({
    userId: user._id,
    title: 'CORS credentials blocking HTTP-only cookie in dev',
    domain: 'TOOLING_ENVIRONMENT',
    status: 'RESOLVED',
    problemStatement: {
      whatTryingToDo: 'Store JWT in HTTP-only cookie between client port 5173 and server port 5000.',
      whatHappeningInstead: 'Set-Cookie header was blocked because origin wildcard was used with credentials: true.',
      whatAlreadyTried: 'Added cors() with no parameters, then cors({ origin: "*" }).',
      codeSnippetOrLogs: 'app.use(cors({ origin: "*" }));',
      techStackContext: ['Node.js', 'Express', 'React', 'CORS'],
    },
    diagnosis: {
      stuckType: 'ENVIRONMENT_OR_CONFIG_DRIFT',
      confidenceScore: 0.94,
      stuckScore: 32,
      severityLevel: 'MILD_BLOCKER',
      rootCauseSummary: 'CORS specification forbids wildcard origins whenever request credentials mode is "include".',
      whyYouAreStuck: 'You are treating CORS as a simple permission toggle instead of a browser-enforced origin reflector contract.',
      keyMisconception: 'Assuming wildcard origins work with credentials.',
    },
    clarificationQuestions: [
      {
        questionId: 'q1',
        questionText: 'Is the client sending withCredentials: true on requests?',
        purpose: 'Isolates whether credentials mode is active.',
        userResponse: 'Yes, withCredentials: true is set on axios instance.',
      }
    ],
    solution: {
      mentalModelExplanation: 'Browsers enforce Same-Origin Policy. When cookies are exchanged cross-origin, the server must reflect the exact requesting origin and declare Access-Control-Allow-Credentials: true.',
      correctApproachOverview: 'Set cors({ origin: "http://localhost:5173", credentials: true }) on the Express server.',
      antiPatternsToAvoid: ['Using wildcard origin with credentials', 'Setting credentials on client without matching server header'],
      actionItems: [
        {
          order: 1,
          task: 'Specify client origin explicitly in CORS middleware',
          rationale: 'Allows browser to permit credentials exchange.',
          codeSnippet: 'app.use(cors({ origin: "http://localhost:5173", credentials: true }));',
          completed: true,
        }
      ],
      verificationTest: 'Inspect Network tab: response contains Access-Control-Allow-Credentials: true and cookie is stored in Application > Cookies.',
    },
    resolution: {
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      timeToUnstuckMinutes: 12,
      whatActuallyFixedIt: 'Configured explicit client origin and enabled credentials in both express cors and axios.',
      reflectionNotes: 'Never use wildcard origin when authentication cookies are involved.',
      userHelpfulnessRating: 5,
    },
    tags: ['cors', 'cookies', 'express', 'security'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  });

  // 2. Resolved session 2: React infinite loop
  const s2 = await StuckSession.create({
    userId: user._id,
    title: 'Infinite re-render loop on data fetch effect',
    domain: 'CODING_DEBUGGING',
    status: 'RESOLVED',
    problemStatement: {
      whatTryingToDo: 'Fetch user profile data and update component state when userId changes.',
      whatHappeningInstead: 'Maximum update depth exceeded warning; tab froze.',
      whatAlreadyTried: 'Added [userId] to dependencies, then created inline config object inside effect dependencies.',
      codeSnippetOrLogs: 'useEffect(() => { fetchUser({ id: userId }); }, [{ id: userId }]);',
      techStackContext: ['React', 'Hooks', 'Vite'],
    },
    diagnosis: {
      stuckType: 'MENTAL_MODEL_DISTORTION',
      confidenceScore: 0.92,
      stuckScore: 48,
      severityLevel: 'MODERATE_IMPASSE',
      rootCauseSummary: 'Inline object recreation in dependency array causes referential inequality on every render.',
      whyYouAreStuck: 'You are thinking { id: userId } === { id: userId } evaluates to true, but in JavaScript objects compare by memory reference.',
      keyMisconception: 'Believing object literals retain referential identity across renders.',
    },
    clarificationQuestions: [
      {
        questionId: 'q1',
        questionText: 'Is the object dependency declared inline in render?',
        purpose: 'Checks referential inequality.',
        userResponse: 'Yes, { id: userId } was written directly in dependency array.',
      }
    ],
    solution: {
      mentalModelExplanation: 'Every render generates a new object in memory. React compares dependencies using Object.is. Different references cause React to execute the effect again, triggering another render.',
      correctApproachOverview: 'Pass primitive values like userId directly into dependency array.',
      antiPatternsToAvoid: ['Passing non-memoized objects or functions to dependencies'],
      actionItems: [
        {
          order: 1,
          task: 'Change dependency array to use primitive userId',
          rationale: 'Primitives compare by value, maintaining stability.',
          codeSnippet: 'useEffect(() => {\n  fetchUser(userId);\n}, [userId]);',
          completed: true,
        }
      ],
      verificationTest: 'Component renders twice on initial mount in StrictMode and stops, with no loop warning.',
    },
    resolution: {
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      timeToUnstuckMinutes: 8,
      whatActuallyFixedIt: 'Passed primitive userId to dependencies instead of inline object literal.',
      reflectionNotes: 'Always use primitive identifiers in dependency arrays unless memoized with useMemo.',
      userHelpfulnessRating: 5,
    },
    tags: ['react', 'useeffect', 'state-loop', 'memoization'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  });

  // 3. Active session: Mongoose async deadlock
  const s3 = await StuckSession.create({
    userId: user._id,
    title: 'Mongoose query returning stale ranking under rapid clicks',
    domain: 'CODING_DEBUGGING',
    status: 'PLAN_READY',
    problemStatement: {
      whatTryingToDo: 'Increment user points and query the updated top leaderboard in the same route.',
      whatHappeningInstead: 'Leaderboard occasionally returns old point total.',
      whatAlreadyTried: 'Wrapped in setTimeout, tried chaining then callbacks.',
      codeSnippetOrLogs: 'User.updateOne({ _id }, { $inc: { points: 10 } });\nconst top = await User.find().sort({ points: -1 }).limit(5);',
      techStackContext: ['Node.js', 'MongoDB', 'Mongoose'],
    },
    diagnosis: {
      stuckType: 'EDGE_CASE_BLINDSPOT',
      confidenceScore: 0.89,
      stuckScore: 56,
      severityLevel: 'MODERATE_IMPASSE',
      rootCauseSummary: 'The updateOne query was not awaited, creating a race condition between write and read.',
      whyYouAreStuck: 'You assumed updateOne executes before the next line of code, but without await it fires concurrently.',
      keyMisconception: 'Assuming database write operations are synchronous if not assigned to a variable.',
    },
    clarificationQuestions: [
      {
        questionId: 'q1',
        questionText: 'Is the updateOne call explicitly preceded by the `await` keyword?',
        purpose: 'Confirms Promise suspension.',
        userResponse: 'I forgot the await before User.updateOne!',
      }
    ],
    solution: {
      mentalModelExplanation: 'Database queries in Node.js are asynchronous I/O operations. Without await, the read query executes before the write has committed to the database engine.',
      correctApproachOverview: 'Await the update operation or use findOneAndUpdate with { new: true } if you need the updated document directly.',
      antiPatternsToAvoid: ['Fire-and-forget database writes before dependent queries', 'Using setTimeout to simulate async coordination'],
      actionItems: [
        {
          order: 1,
          task: 'Add await keyword to User.updateOne call',
          rationale: 'Ensures the write completes before querying the leaderboard.',
          codeSnippet: 'await User.updateOne({ _id }, { $inc: { points: 10 } });\nconst top = await User.find().sort({ points: -1 }).limit(5);',
          completed: false,
        },
        {
          order: 2,
          task: 'Verify transactional consistency under rapid test requests',
          rationale: 'Confirms race condition is eliminated.',
          codeSnippet: '// Run automated concurrency test script',
          completed: false,
        }
      ],
      verificationTest: 'Send 5 sequential requests and confirm the returned points monotonically increase by 10 each time.',
    },
    tags: ['mongoose', 'async-await', 'race-condition', 'mongodb'],
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  });

  // Calculate learning patterns
  const patterns = await recalculateUserPatterns(user._id);
  console.log('[Seed] Calculated User Patterns:', {
    total: patterns.totalSessionsCount,
    resolved: patterns.resolvedSessionsCount,
    blindspots: patterns.identifiedBlindspots.length,
  });

  console.log('[Seed] Seeding completed successfully!');
  await mongoose.disconnect();
}

seedData().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
