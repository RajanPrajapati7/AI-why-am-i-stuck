import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:5000/api';

describe('Backend API Integration Tests', () => {
  let authCookie = '';
  const testEmail = `apitest_${Date.now()}@antigravity.ai`;

  beforeAll(async () => {
    // Register a fresh user to get an auth cookie for integration testing
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'API Tester',
        email: testEmail,
        password: 'password123',
        experienceLevel: 'BEGINNER',
        primaryTechStack: ['Python', 'Django'],
      }),
    });

    const setCookie = regRes.headers.get('set-cookie');
    if (setCookie) {
      authCookie = setCookie.split(';')[0];
    }
  });

  describe('Authentication Protection & Authorization', () => {
    it('rejects unauthenticated requests to protected profile route with 401', async () => {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hacker' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('rejects unauthenticated requests to protected settings route with 401', async () => {
      const res = await fetch(`${BASE_URL}/auth/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appearance: 'light' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('rejects unauthenticated re-diagnosis requests with 401', async () => {
      const res = await fetch(`${BASE_URL}/sessions/60f719b2e1f2b34a1c8b4567/rediagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatHappenedWhenTried: 'Tried it',
          whatExpectedToHappen: 'Worked',
          whatActuallyHappened: 'Failed',
        }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Schema Validation Rejections (HTTP 400)', () => {
    it('rejects malformed registration payload with 400', async () => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          email: 'invalid-email',
          password: 'short',
        }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
    });

    it('rejects invalid profile update payload with 400', async () => {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookie,
        },
        body: JSON.stringify({
          experienceLevel: 'SUPER_INVALID_LEVEL',
        }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  describe('Profile & Settings Updates', () => {
    it('successfully updates developer profile when authenticated', async () => {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookie,
        },
        body: JSON.stringify({
          name: 'Updated API Tester',
          experienceLevel: 'INTERMEDIATE',
          primaryTechStack: ['Python', 'FastAPI', 'PostgreSQL'],
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user.name).toBe('Updated API Tester');
      expect(data.user.experienceLevel).toBe('INTERMEDIATE');
      expect(data.user.primaryTechStack).toContain('FastAPI');
    });

    it('successfully updates application settings when authenticated', async () => {
      const res = await fetch(`${BASE_URL}/auth/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: authCookie,
        },
        body: JSON.stringify({
          appearance: 'dark',
          aiPreferences: {
            enableCognitiveCoaching: true,
            enableSocraticQuestioning: true,
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user.settings.appearance).toBe('dark');
      expect(data.user.settings.aiPreferences.enableCognitiveCoaching).toBe(true);
    });
  });
});
