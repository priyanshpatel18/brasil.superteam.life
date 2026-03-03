"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Bell, BookOpen, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks";

function iconForType(type: string) {
  switch (type) {
    case "leaderboard_update":
      return <Trophy className="h-4 w-4" />;
    case "new_course":
      return <BookOpen className="h-4 w-4" />;
    case "new_challenge":
    case "challenge_submission":
      return <Target className="h-4 w-4" />;
    case "invalid_submission":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

export default function NotificationsPage() {
  const { data, isLoading, error, markReadAsync } = useNotifications();
  const notifications = data ?? [];

  useEffect(() => {
    const unreadIds = notifications.filter((n) => !n.readAt).map((n) => n.id);
    if (unreadIds.length) {
      void markReadAsync(unreadIds);
    }
  }, [notifications, markReadAsync]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-game text-2xl sm:text-3xl">Notifications</h1>
          <p className="font-game text-md text-muted-foreground">
            Updates about your XP, courses, and challenges.
          </p>
        </div>
      </div>

      {isLoading && (
        <p className="font-game text-md text-muted-foreground">
          Loading notifications…
        </p>
      )}

      {error && (
        <p className="font-game text-md text-destructive">
          {(error as Error).message}
        </p>
      )}

      {!isLoading && !error && notifications.length === 0 && (
        <p className="font-game text-md text-muted-foreground">
          You&apos;re all caught up. No notifications yet.
        </p>
      )}

      <ul className="space-y-3 text-md">
        {notifications.map((n) => {
          const createdAt = new Date(n.createdAt);
          const when = formatDistanceToNow(createdAt, { addSuffix: true });
          const type = n.type;
          const data = n.data ?? {};

          let title = "";
          let description: string | null = null;
          let href: string | null = null;

          switch (type) {
            case "leaderboard_update": {
              const position = (data.position as number) ?? null;
              const totalXp = (data.totalXp as number) ?? null;
              title =
                position && totalXp != null
                  ? `Leaderboard: you are #${position} with ${totalXp} XP`
                  : "Leaderboard updated";
              href = "/leaderboard";
              break;
            }
            case "new_course": {
              const courseId = (data.courseId as string) ?? "";
              title = data.title
                ? `New course: ${String(data.title)}`
                : "New course available";
              href = courseId ? `/courses/${courseId}` : "/courses";
              break;
            }
            case "new_challenge": {
              title = data.title
                ? `New challenge: ${String(data.title)}`
                : "New challenge available";
              href =
                typeof data.slug === "string"
                  ? `/challenges/${String(data.slug)}`
                  : "/challenges";
              break;
            }
            case "invalid_submission": {
              title = "Challenge submission was marked invalid";
              description = data.challengeTitle
                ? `"${String(data.challengeTitle)}"`
                : null;
              href =
                typeof data.challengeSlug === "string"
                  ? `/challenges/${String(data.challengeSlug)}`
                  : "/challenges";
              break;
            }
            default: {
              title = type.replace(/_/g, " ");
            }
          }

          return (
            <li
              key={n.id}
              className="rounded-2xl border-2 border-border bg-card px-4 py-3 sm:px-5 sm:py-4 flex items-start gap-3"
            >
              <div className="mt-1 text-yellow-400">{iconForType(type)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-game text-md">{title}</p>
                  <span className="font-game text-md text-muted-foreground whitespace-nowrap">
                    {when}
                  </span>
                </div>
                {description && (
                  <p className="font-game text-md text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
                {href && (
                  <Button
                    asChild
                    variant="outline"
                    size="icon-xs"
                    className="font-game mt-2 text-md"
                  >
                    <Link href={href}>Open</Link>
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

