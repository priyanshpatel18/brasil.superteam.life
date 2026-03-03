import { getPrisma } from "@/lib/prisma.js";

export type NotificationTargetRole = "admin" | "learner";

export type NotificationType =
  | "challenge_submission"
  | "invalid_submission"
  | "new_challenge"
  | "new_course"
  | "leaderboard_update";

type NotificationData = Record<string, unknown>;

export async function createNotification(opts: {
  targetRole: NotificationTargetRole;
  type: NotificationType | string;
  wallet?: string | null;
  data?: NotificationData;
}): Promise<void> {
  const prisma = getPrisma();
  await prisma.notification.create({
    data: {
      targetRole: opts.targetRole,
      type: opts.type,
      wallet: opts.wallet ?? null,
      data: (opts.data ?? {}) as unknown as object,
    },
  });
}

export async function createAdminNotification(
  type: NotificationType | string,
  data?: NotificationData
): Promise<void> {
  await createNotification({
    targetRole: "admin",
    type,
    wallet: null,
    data,
  });
}

export async function createUserNotification(opts: {
  wallet: string;
  type: NotificationType | string;
  data?: NotificationData;
}): Promise<void> {
  await createNotification({
    targetRole: "learner",
    wallet: opts.wallet,
    type: opts.type,
    data: opts.data,
  });
}

