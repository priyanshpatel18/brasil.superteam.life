import type { Hono } from "hono";
import { getPrisma } from "@/lib/prisma.js";
import { badRequest, withRouteErrorHandling } from "@/lib/errors.js";

export function registerNotificationRoutes(app: Hono): void {
  app.get(
    "/notifications",
    withRouteErrorHandling(async (c) => {
      const prisma = getPrisma();
      const wallet = c.req.query("wallet") ?? null;
      const role = c.req.query("role") ?? "learner";
      if (role !== "admin" && role !== "learner") {
        throw badRequest("role must be admin or learner");
      }

      const where =
        role === "admin"
          ? { targetRole: "admin" as const }
          : {
              targetRole: "learner" as const,
              wallet: wallet || undefined,
            };

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      const items = notifications.map((n) => ({
        id: n.id,
        wallet: n.wallet,
        targetRole: n.targetRole,
        type: n.type,
        data: n.data,
        readAt: n.readAt,
        createdAt: n.createdAt,
      }));

      return c.json({ notifications: items });
    })
  );

  app.post(
    "/notifications/mark-read",
    withRouteErrorHandling(async (c) => {
      const prisma = getPrisma();
      const body = (await c.req.json().catch(() => ({}))) as {
        ids?: number[];
      };
      const ids = Array.isArray(body.ids) ? body.ids : [];
      if (!ids.length) {
        throw badRequest("ids array is required");
      }
      await prisma.notification.updateMany({
        where: { id: { in: ids } },
        data: { readAt: new Date() },
      });
      return c.json({ ok: true });
    })
  );
}

