import "dotenv/config";
import { getPrisma } from "@/lib/prisma.js";
import { Prisma } from "@prisma/client";
import { createUserNotification } from "@/academy/notifications.js";

export async function syncLeaderboardFromUsers(): Promise<void> {
  const prisma = getPrisma();
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO leaderboard_entries (wallet, total_xp, courses_completed, updated_at)
    SELECT wallet, total_xp, courses_completed, NOW()
    FROM users
    ON CONFLICT (wallet) DO UPDATE SET
      total_xp = EXCLUDED.total_xp,
      courses_completed = EXCLUDED.courses_completed,
      updated_at = NOW()
  `);
  const entries = await prisma.leaderboardEntry.findMany({
    orderBy: { totalXp: "desc" },
  });
  console.log(`Synced ${entries.length} leaderboard entries from users`);

  // Best-effort daily leaderboard notifications for top users.
  const maxNotified = 100;
  const topEntries = entries.slice(0, maxNotified);
  await Promise.all(
    topEntries.map((entry, index) =>
      createUserNotification({
        wallet: entry.wallet,
        type: "leaderboard_update",
        data: {
          position: index + 1,
          totalXp: entry.totalXp,
          coursesCompleted: entry.coursesCompleted,
        },
      }).catch((err) =>
        console.error("leaderboard notification failed", {
          wallet: entry.wallet,
          error: String(err),
        })
      )
    )
  );
}

async function main(): Promise<void> {
  await syncLeaderboardFromUsers();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
