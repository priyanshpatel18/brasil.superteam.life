/**
 * Shared API mock helpers for E2E tests that need to simulate wallet-connected state.
 * Use page.route() to intercept /api/academy/* and /api/user/* and return fixed data.
 */

export const MOCK_WALLET = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

export const mockXpBalance = (xp: number) => ({
  ok: true,
  data: { balance: xp },
});

export const mockEnrollment = (courseId: string, completed: boolean) => ({
  ok: true,
  data: {
    enrollment: {
      courseId,
      completedAt: completed ? new Date().toISOString() : null,
      lessonFlags: completed ? [1, 1, 1] : [1, 0, 0],
    },
  },
});

export const mockUserStats = (coursesCompleted: number, totalXp: number) => ({
  coursesCompleted,
  totalXp,
});
