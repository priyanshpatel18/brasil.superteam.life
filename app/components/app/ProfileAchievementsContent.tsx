"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Award,
  Trophy,
  Flame,
  CalendarCheck2,
  ShieldCheck,
  BookOpen,
  Hammer,
  MessageSquare,
  MessageCircle,
  Bug,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useXpBalanceFor,
  useCredentialsFor,
  useCoursesCompletedFor,
  useCommunityStats,
} from "@/hooks";
import { getMockStreakData } from "@/lib/services/mock-leaderboard";
import { cn } from "@/lib/utils";

type AchievementCategory =
  | "Progress"
  | "Streaks"
  | "Skills"
  | "Community"
  | "Special";

interface AchievementItem {
  id: string;
  title: string;
  category: AchievementCategory;
  description: string;
  icon: LucideIcon;
  value: number;
  target: number;
  unit?: string;
}

export function ProfileAchievementsContent({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const { data: xp, isLoading: xpLoading } = useXpBalanceFor(walletAddress);
  const { data: credentials, isLoading: credsLoading } = useCredentialsFor(walletAddress);
  const { data: coursesCompleted, isLoading: coursesLoading } =
    useCoursesCompletedFor(walletAddress);
  const { data: communityStats, isLoading: communityLoading } =
    useCommunityStats(walletAddress);

  const xpValue = xp ?? 0;
  const coursesCompletedValue = coursesCompleted ?? 0;
  const credentialsCount = credentials?.length ?? 0;
  const streak = getMockStreakData().current;
  const threadCount = communityStats?.threadCount ?? 0;
  const replyCount = communityStats?.replyCount ?? 0;
  const totalContributions = communityStats?.totalContributions ?? 0;

  const achievements: AchievementItem[] = [
    {
      id: "first-steps",
      title: "First Steps",
      category: "Progress",
      description: "Complete your first course.",
      icon: Sparkles,
      value: coursesCompletedValue,
      target: 1,
    },
    {
      id: "course-completer",
      title: "Course Completer",
      category: "Progress",
      description: "Complete 3 courses.",
      icon: Award,
      value: coursesCompletedValue,
      target: 3,
    },
    {
      id: "speed-runner",
      title: "Speed Runner",
      category: "Progress",
      description: "Complete 5 courses.",
      icon: Trophy,
      value: coursesCompletedValue,
      target: 5,
    },
    {
      id: "week-warrior",
      title: "Week Warrior",
      category: "Streaks",
      description: "Reach a 7-day streak.",
      icon: Flame,
      value: streak,
      target: 7,
      unit: "days",
    },
    {
      id: "monthly-master",
      title: "Monthly Master",
      category: "Streaks",
      description: "Reach a 30-day streak.",
      icon: CalendarCheck2,
      value: streak,
      target: 30,
      unit: "days",
    },
    {
      id: "consistency-king",
      title: "Consistency King",
      category: "Streaks",
      description: "Reach a 60-day streak.",
      icon: ShieldCheck,
      value: streak,
      target: 60,
      unit: "days",
    },
    {
      id: "rust-rookie",
      title: "Rust Rookie",
      category: "Skills",
      description: "Earn 500 XP.",
      icon: BookOpen,
      value: xpValue,
      target: 500,
      unit: "XP",
    },
    {
      id: "anchor-expert",
      title: "Anchor Expert",
      category: "Skills",
      description: "Earn 2,500 XP.",
      icon: Hammer,
      value: xpValue,
      target: 2500,
      unit: "XP",
    },
    {
      id: "fullstack-solana",
      title: "Full Stack Solana",
      category: "Skills",
      description: "Earn 8,000 XP.",
      icon: Sparkles,
      value: xpValue,
      target: 8000,
      unit: "XP",
    },
    {
      id: "helper",
      title: "Helper",
      category: "Community",
      description: "Post 5 replies in discussions.",
      icon: MessageSquare,
      value: replyCount,
      target: 5,
    },
    {
      id: "first-comment",
      title: "First Comment",
      category: "Community",
      description: "Post your first reply.",
      icon: MessageCircle,
      value: replyCount,
      target: 1,
    },
    {
      id: "top-contributor",
      title: "Top Contributor",
      category: "Community",
      description: "Make 15 community contributions.",
      icon: Award,
      value: totalContributions,
      target: 15,
    },
    {
      id: "early-adopter",
      title: "Early Adopter",
      category: "Special",
      description: "Earn your first on-chain credential.",
      icon: Star,
      value: credentialsCount,
      target: 1,
    },
    {
      id: "bug-hunter",
      title: "Bug Hunter",
      category: "Special",
      description: "Start 3 community threads.",
      icon: Bug,
      value: threadCount,
      target: 3,
    },
    {
      id: "perfect-score",
      title: "Perfect Score",
      category: "Special",
      description: "Earn 3 credentials.",
      icon: Trophy,
      value: credentialsCount,
      target: 3,
    },
  ];

  const isLoading = xpLoading || credsLoading || coursesLoading || communityLoading;
  const unlockedAchievements = achievements.filter(
    (item) => item.value >= item.target
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Button asChild variant="outline" className="font-game text-base">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
        <div className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 font-game text-sm text-yellow-400">
          {isLoading ? "..." : `${unlockedAchievements}/${achievements.length} unlocked`}
        </div>
      </div>

      <h1 className="font-game text-4xl sm:text-5xl">Achievements &amp; Badges</h1>
      <p className="mt-2 font-game text-muted-foreground text-sm sm:text-base">
        Progress, streak, skills, community, and special milestones.
      </p>

      <div className="mt-6 space-y-4">
        {(["Progress", "Streaks", "Skills", "Community", "Special"] as AchievementCategory[]).map(
          (category) => {
            const items = achievements.filter((item) => item.category === category);
            return (
              <section
                key={category}
                className="rounded-2xl border-4 bg-card p-4 sm:p-5"
              >
                <h2 className="font-game text-2xl mb-3">{category}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const unlocked = item.value >= item.target;
                    const progressPct = Math.min(
                      100,
                      Math.round((item.value / item.target) * 100)
                    );
                    const current = Math.min(item.value, item.target);
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "rounded-xl border p-3",
                          unlocked
                            ? "border-yellow-400/50 bg-yellow-400/5"
                            : "border-border bg-muted/20"
                        )}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <item.icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                unlocked ? "text-yellow-400" : "text-muted-foreground"
                              )}
                            />
                            <h3 className="font-game text-lg truncate">{item.title}</h3>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-game shrink-0",
                              unlocked
                                ? "bg-yellow-400/20 text-yellow-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {unlocked ? "Unlocked" : "In progress"}
                          </span>
                        </div>
                        <p className="font-game text-xs text-muted-foreground min-h-[2.25rem]">
                          {item.description}
                        </p>
                        <div className="mt-2 h-2 rounded-full border border-border bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              unlocked ? "bg-yellow-400" : "bg-muted-foreground/60"
                            )}
                            style={{ width: `${isLoading ? 0 : progressPct}%` }}
                          />
                        </div>
                        <p className="mt-1 font-game text-xs text-muted-foreground">
                          {isLoading
                            ? "Loading..."
                            : `${current.toLocaleString()}/${item.target.toLocaleString()}${
                                item.unit ? ` ${item.unit}` : ""
                              }`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          }
        )}
      </div>

      <div className="mt-4 rounded-xl border border-yellow-400/25 bg-yellow-400/5 p-4">
        <p className="font-game text-sm text-muted-foreground leading-relaxed">
          On-chain achievements use <span className="text-foreground">AchievementType</span> and
          <span className="text-foreground"> AchievementReceipt</span> PDAs. Each award mints a
          soulbound Metaplex Core NFT to the recipient, with configurable supply caps and XP
          rewards.
        </p>
      </div>
    </div>
  );
}
