"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Trophy, BookOpen, Target, AlertCircle } from "lucide-react";
import { useNotifications, type NotificationItem } from "@/hooks";
import { Button } from "@/components/ui/button";

function iconForType(type: string) {
  switch (type) {
    case "leaderboard_update":
      return <Trophy className="h-3.5 w-3.5" />;
    case "new_course":
      return <BookOpen className="h-3.5 w-3.5" />;
    case "new_challenge":
    case "challenge_submission":
      return <Target className="h-3.5 w-3.5" />;
    case "invalid_submission":
      return <AlertCircle className="h-3.5 w-3.5" />;
    default:
      return <Bell className="h-3.5 w-3.5" />;
  }
}

function formatTimeAgoShort(date: Date): string {
  const seconds = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    if (minutes === 1) return "1 min ago";
    return `${minutes} mins ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    if (hours === 1) return "1 hr ago";
    return `${hours} hrs ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    if (months === 1) return "1 mo ago";
    return `${months} mos ago`;
  }
  const years = Math.floor(months / 12);
  if (years === 1) return "1 yr ago";
  return `${years} yrs ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data, isLoading, error, markReadAsync } = useNotifications();
  const notifications = (data ?? []) as NotificationItem[];
  const unreadCount = notifications.filter((n: NotificationItem) => !n.readAt).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const unreadIds = notifications
      .filter((n: NotificationItem) => !n.readAt)
      .map((n: NotificationItem) => n.id);
    if (unreadIds.length) {
      void markReadAsync(unreadIds);
    }
  }, [open, notifications, markReadAsync]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center size-9 rounded-full border border-border bg-background/70 hover:bg-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-yellow-400 text-[10px] font-semibold text-black flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-card shadow-lg z-50 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/60 mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400/10 border border-yellow-400/40 text-yellow-400">
                <Bell className="h-3.5 w-3.5" />
              </span>
              <p className="font-game text-lg text-foreground">
                Notifications
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="font-game text-md text-yellow-400">
                {unreadCount} new
              </span>
            )}
          </div>

          {isLoading && (
            <p className="font-game text-md text-muted-foreground">
              Loading…
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

          {!isLoading && !error && notifications.length > 0 && (
            <>
              <ul className="space-y-1.5 text-md">
                {notifications.slice(0, 6).map((n: NotificationItem) => {
                  const createdAt = new Date(n.createdAt);
                  const when = formatTimeAgoShort(createdAt);
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
                          ? `You are #${position} with ${totalXp} XP`
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
                      className="flex items-start gap-2 rounded-lg border border-border/60 bg-background/70 px-2 py-1.5"
                    >
                      <div className="mt-0.5 text-yellow-400">
                        {iconForType(type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-game text-md text-foreground">
                            {title}
                          </p>
                          <span className="font-game text-md text-muted-foreground shrink-0">
                            {when}
                          </span>
                        </div>
                        {description && (
                          <p className="font-game text-md text-muted-foreground mt-0.5">
                            {description}
                          </p>
                        )}
                        {href && (
                          <Button
                            asChild
                            variant="outline"
                            size="xs"
                            className="font-game mt-1 text-md"
                          >
                            <Link href={href}>Open</Link>
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {notifications.length > 6 && (
                <div className="pt-1 border-t border-border/60 mt-1 flex justify-end">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon-xs"
                    className="font-game h-6 px-2 text-md"
                  >
                    <Link href="/notifications">View all</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
