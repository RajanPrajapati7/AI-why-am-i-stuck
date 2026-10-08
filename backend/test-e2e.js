const BASE_URL = 'http://localhost:5000/api';

async function runE2ETest() {
  console.log('--- STARTING E2E INTEGRATION & WORKFLOW VERIFICATION ---');

  let authCookie = '';

  const request = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (authCookie) {
      headers['Cookie'] = authCookie;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      authCookie = setCookie.split(';')[0];
    }

    const data = await res.json().catch(() => ({}));
    return { status: res.status, data, headers: res.headers };
  };

  // 1. Health check
  const healthRes = await request('/health', { method: 'GET' });
  console.log('1. Health Check Status:', healthRes.status, healthRes.data.status);
  if (healthRes.status !== 200) throw new Error('Health check failed');

  // 2. Register user
  const email = `developer_${Date.now()}@antigravity.ai`;
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Cognitive Developer',
      email,
      password: 'cognitive1234',
      experienceLevel: 'INTERMEDIATE',
      primaryTechStack: ['React', 'Node.js', 'Vite'],
    }),
  });

  console.log('2. Register Status:', regRes.status, 'User:', regRes.data.user?.name);
  if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
  console.log('   Captured Auth Cookie:', authCookie.slice(0, 20) + '...');

  // 3. Verify /auth/me
  const meRes = await request('/auth/me', { method: 'GET' });
  console.log('3. Auth /me Status:', meRes.status, 'Email:', meRes.data.user?.email);
  if (meRes.status !== 200) throw new Error('/auth/me failed');

  // 4. Create Stuck Problem Intake (Stage 1 Diagnosis)
  console.log('4. Submitting Problem Statement for Cognitive Diagnosis...');
  const intakeRes = await request('/sessions', {
    method: 'POST',
    body: JSON.stringify({
      domain: 'CODING_DEBUGGING',
      whatTryingToDo: 'Fetch user profile data whenever userId prop changes in my React component.',
      whatHappeningInstead: 'Component re-renders infinitely and browser tab locks up with "Maximum update depth exceeded" warning.',
      whatAlreadyTried: 'Added userId to dependency array, but then tried passing an inline userConfig object { id: userId }, which made it loop constantly.',
      codeSnippetOrLogs: 'useEffect(() => {\n  const config = { id: userId };\n  fetchUser(config).then(res => setUser(res.data));\n}, [config]);',
      techStackContext: ['React', 'JavaScript', 'Vite'],
    }),
  });

  console.log('   Diagnosis Status:', intakeRes.status);
  if (intakeRes.status !== 201) throw new Error(`Session creation failed: ${JSON.stringify(intakeRes.data)}`);

  const session = intakeRes.data.session;
  console.log('   Stuck Type Classified:', session.diagnosis?.stuckType);
  console.log('   Confidence Score:', session.diagnosis?.confidenceScore);
  console.log('   Stuck Score (0-100):', session.diagnosis?.stuckScore);
  console.log('   Severity Level:', session.diagnosis?.severityLevel);
  if (typeof session.diagnosis?.stuckScore !== 'number') throw new Error('Stuck score missing from diagnosis');
  console.log('   Root Cause:', session.diagnosis?.rootCauseSummary);
  console.log('   Why You Are Stuck:', session.diagnosis?.whyYouAreStuck);
  console.log('   Key Misconception:', session.diagnosis?.keyMisconception);
  console.log('   Clarification Questions Count:', session.clarificationQuestions?.length);

  // 5. Answer Socratic Clarification Questions (Stage 2 Solution Generation)
  console.log('5. Answering Socratic Questions to unlock Action Plan...');
  const answers = session.clarificationQuestions.map((q) => ({
    questionId: q.questionId,
    responseText: q.suggestedOptions?.[0] || 'Confirmed runtime behavior',
  }));

  const answerRes = await request(`/sessions/${session._id}/answers`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });

  console.log('   Action Plan Generation Status:', answerRes.status);
  if (answerRes.status !== 200) throw new Error(`Answer submission failed: ${JSON.stringify(answerRes.data)}`);

  const updatedSession = answerRes.data.session;
  console.log('   Mental Model:', updatedSession.solution?.mentalModelExplanation?.slice(0, 90) + '...');
  console.log('   Action Items Checklist Length:', updatedSession.solution?.actionItems?.length);
  console.log('   Verification Test:', updatedSession.solution?.verificationTest);

  // 6. Toggle Checklist Items
  console.log('6. Toggling Action Item Checkbox...');
  const toggleRes = await request(`/sessions/${session._id}/actions/0`, {
    method: 'PATCH',
    body: JSON.stringify({ completed: true }),
  });
  console.log('   Toggle Status:', toggleRes.status, 'Item 0 Completed:', toggleRes.data.session.solution.actionItems[0].completed);

  // 7. Test "Still Stuck / Re-diagnose" Flow
  console.log('7. Testing "Still Stuck / Re-diagnose" Flow with new empirical observations...');
  const rediagnoseRes = await request(`/sessions/${session._id}/rediagnose`, {
    method: 'POST',
    body: JSON.stringify({
      whatHappenedWhenTried: 'I changed the dependency to primitive userId, but now the browser reports a CORS origin mismatch error on the fetch call.',
      whatExpectedToHappen: 'Expected the request to succeed and populate user profile data.',
      whatActuallyHappened: 'The infinite loop stopped, but the network request failed with CORS error 403 / unreflected origin.',
      newErrorOrLogs: 'Access-Control-Allow-Origin missing or origin mismatch for http://localhost:5173',
    }),
  });

  console.log('   Re-diagnosis Status:', rediagnoseRes.status);
  if (rediagnoseRes.status !== 200) throw new Error(`Re-diagnosis failed: ${JSON.stringify(rediagnoseRes.data)}`);

  const rediagnosedSession = rediagnoseRes.data.session;
  console.log('   Re-evaluation Rationale:', rediagnoseRes.data.reEvaluationRationale);
  console.log('   Revised Stuck Type:', rediagnosedSession.diagnosis?.stuckType);
  console.log('   Revised Stuck Score (0-100):', rediagnosedSession.diagnosis?.stuckScore);
  console.log('   Revised Severity Level:', rediagnosedSession.diagnosis?.severityLevel);
  console.log('   Revisions History Count:', rediagnosedSession.revisions?.length);
  if (!rediagnosedSession.revisions || rediagnosedSession.revisions.length !== 1) {
    throw new Error('Revisions history was not preserved in session document');
  }
  console.log('   Preserved Previous Diagnosis:', rediagnosedSession.revisions[0].previousDiagnosis?.stuckType);
  console.log('   Revised Action Items Count:', rediagnosedSession.solution?.actionItems?.length);
  console.log('   Revised Verification Test:', rediagnosedSession.solution?.verificationTest);

  // 8. Resolve Session with Post-Mortem Reflection
  console.log('8. Resolving Session with Post-Mortem Reflection...');
  const resolveRes = await request(`/sessions/${session._id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({
      whatActuallyFixedIt: 'Configured explicit client origin in backend CORS and enabled credentials in axios client.',
      reflectionNotes: 'When fixing one layer (render loop), be prepared to inspect the subsequent network/environment layer.',
      userHelpfulnessRating: 5,
    }),
  });
  console.log('   Resolve Status:', resolveRes.status, 'New Status:', resolveRes.data.session?.status);
  console.log('   Resolution Time:', resolveRes.data.session?.resolution?.timeToUnstuckMinutes, 'min');

  // 8. Fetch Long-Term Learning Patterns
  console.log('8. Verifying Long-Term Pattern Analytics...');
  const patternRes = await request('/analytics/patterns', { method: 'GET' });
  console.log('   Pattern Status:', patternRes.status);
  console.log('   Total Sessions in Profile:', patternRes.data.patterns?.totalSessionsCount);
  console.log('   Resolved Count:', patternRes.data.patterns?.resolvedSessionsCount);
  console.log('   Stuck Type Frequencies:', patternRes.data.patterns?.stuckTypeFrequencies);
  console.log('   AI-Identified Blindspots Count:', patternRes.data.patterns?.identifiedBlindspots?.length);
  if (patternRes.data.patterns?.identifiedBlindspots?.[0]) {
    console.log('   Top Blindspot:', patternRes.data.patterns.identifiedBlindspots[0].category);
  }

  // 9. Profile Update & Persistence
  console.log('9. Testing Profile Update (PUT /api/auth/profile)...');
  const profileRes = await request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({
      name: 'Ada Lovelace Lead',
      experienceLevel: 'ADVANCED',
      primaryTechStack: ['TypeScript', 'Node.js', 'Go', 'Docker'],
    }),
  });
  console.log('   Profile Update Status:', profileRes.status, 'Updated Name:', profileRes.data.user?.name);
  if (profileRes.status !== 200) throw new Error('Profile update failed');
  if (profileRes.data.user?.experienceLevel !== 'ADVANCED') throw new Error('Experience level was not updated');
  if (!profileRes.data.user?.primaryTechStack.includes('Docker')) throw new Error('Tech stack was not updated');

  // Verify /me returns updated profile
  const verifyMeRes = await request('/auth/me', { method: 'GET' });
  if (verifyMeRes.data.user?.name !== 'Ada Lovelace Lead') throw new Error('Profile update did not persist to /me');
  console.log('   Verified Profile Persisted: Name =', verifyMeRes.data.user?.name, ', Level =', verifyMeRes.data.user?.experienceLevel);

  // 10. Settings Update & Persistence
  console.log('10. Testing Settings Update (PUT /api/auth/settings)...');
  const settingsRes = await request('/auth/settings', {
    method: 'PUT',
    body: JSON.stringify({
      appearance: 'dark',
      aiPreferences: {
        enableCognitiveCoaching: true,
        enableSocraticQuestioning: false,
      },
    }),
  });
  console.log('   Settings Update Status:', settingsRes.status, 'Appearance:', settingsRes.data.user?.settings?.appearance);
  if (settingsRes.status !== 200) throw new Error('Settings update failed');
  if (settingsRes.data.user?.settings?.aiPreferences?.enableSocraticQuestioning !== false) {
    throw new Error('Settings aiPreferences was not updated');
  }

  // Verify /me returns updated settings
  const verifySettingsMe = await request('/auth/me', { method: 'GET' });
  if (verifySettingsMe.data.user?.settings?.aiPreferences?.enableSocraticQuestioning !== false) {
    throw new Error('Settings update did not persist to /me');
  }
  console.log('   Verified Settings Persisted: Socratic =', verifySettingsMe.data.user?.settings?.aiPreferences?.enableSocraticQuestioning);

  // 11. Security Protection: Unauthorized requests rejected
  console.log('11. Testing Security Protection (Unauthenticated Access Rejection)...');
  const unauthProfile = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Hacker' }),
  });
  console.log('   Unauthenticated PUT /auth/profile Status:', unauthProfile.status);
  if (unauthProfile.status !== 401) throw new Error('Security check failed: unauthenticated access was not rejected');

  const unauthSettings = await fetch(`${BASE_URL}/auth/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appearance: 'light' }),
  });
  console.log('   Unauthenticated PUT /auth/settings Status:', unauthSettings.status);
  if (unauthSettings.status !== 401) throw new Error('Security check failed: unauthenticated settings access was not rejected');

  // 12. Input Validation Rejection
  console.log('12. Testing Zod Validation on Invalid Profile Inputs...');
  const invalidProfile = await request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({
      experienceLevel: 'SUPER_EXPERT_INVALID',
    }),
  });
  console.log('   Invalid Experience Level Status:', invalidProfile.status);
  if (invalidProfile.status !== 400) throw new Error('Validation check failed: invalid enum should be 400');

  // 13. Logout Verification
  console.log('13. Testing User Logout (POST /api/auth/logout)...');
  const logoutRes = await request('/auth/logout', { method: 'POST' });
  console.log('   Logout Status:', logoutRes.status, 'Message:', logoutRes.data.message);
  if (logoutRes.status !== 200) throw new Error('Logout failed');

  console.log('\n--- ALL E2E VERIFICATION CHECKS PASSED WITH 100% SUCCESS! ---');
}

runE2ETest().catch((err) => {
  console.error('\nE2E Test Failed:', err.message);
  process.exit(1);
});
