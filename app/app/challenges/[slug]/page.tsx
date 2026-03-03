"use client";

import { use, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Link2,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@solana/wallet-adapter-react";
import { useChallenges, useCompleteChallenge } from "@/hooks";
import type { ChallengeItem } from "@/hooks/useChallenges";

type ChallengeBySlug = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  xpReward: number;
  seasonId: number | null;
  startsAt: string | null;
  endsAt: string | null;
  seasonName: string | null;
};

export default function ChallengeSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();

  const [challenge, setChallenge] = useState<ChallengeBySlug | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionLink, setSubmissionLink] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const { data: challengesData } = useChallenges(wallet);
  const challenges = challengesData?.challenges ?? [];
  const day = challengesData?.day ?? "";
  const completed = challenges.some((c) => c.slug === slug && c.completed);

  const { mutate: complete, isPending: completing } = useCompleteChallenge(wallet);

  const otherChallenges = useMemo(
    () => challenges.filter((c) => c.slug !== slug),
    [challenges, slug]
  );
  const activeOthers = otherChallenges.filter((c) => !c.completed);
  const completedOthers = otherChallenges.filter((c) => c.completed);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/challenges/by-slug/${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data: ChallengeBySlug & { error?: string }) => {
        if (cancelled) return;
        if (data.error || !data.id) {
          setChallenge(null);
          return;
        }
        setChallenge(data);
      })
      .catch(() => {
        if (!cancelled) setChallenge(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="font-game text-muted-foreground">Loading challenge…</span>
      </div>
    );
  }

  if (!challenge) return notFound();

  const handleComplete = () => {
    const link = submissionLink.trim();
    if (!link) {
      toast.error("Submission link is required to complete this challenge.");
      return;
    }
    if (!/^https?:\/\//i.test(link)) {
      toast.error("Enter a valid URL starting with http:// or https://");
      return;
    }
    if (!wallet) {
      toast.error("Connect your wallet to complete this challenge.");
      return;
    }

    complete(
      { challengeId: challenge.id, submissionLink: link },
      {
        onSuccess: () => {
          toast.success("Challenge completed! XP awarded.");
          setSubmissionLink("");
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to complete challenge"
          ),
      }
    );
  };

  const renderSection = (items: ChallengeItem[], emptyText: string) => {
    if (!items.length) {
      return (
        <div className="rounded-2xl border-2 border-dashed border-border/60 bg-card/40 p-4 text-center">
          <p className="font-game text-sm text-muted-foreground">{emptyText}</p>
        </div>
      );
    }
    return (
      <ul className="space-y-3">
        {items.map((ch) => {
          const isOpen = openId === ch.id;
          return (
            <li
              key={ch.id}
              className="rounded-2xl border-4 border-border bg-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId((prev) => (prev === ch.id ? null : ch.id))}
                className="w-full flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4"
              >
                <span className="shrink-0 text-muted-foreground">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-game text-lg sm:text-xl truncate">
                      {ch.title}
                    </span>
                    {ch.completed && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                    )}
                    {ch.xpReward > 0 && (
                      <span className="font-game text-xs sm:text-sm text-yellow-400 inline-flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        {ch.xpReward} XP
                      </span>
                    )}
                  </div>
                  {ch.description && (
                    <p className="font-game text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {ch.description}
                    </p>
                  )}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-border/70 px-4 py-3 sm:px-5 sm:py-4 space-y-2">
                  {ch.description && (
                    <p className="font-game text-sm text-muted-foreground">
                      {ch.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-game text-xs text-muted-foreground">
                      {ch.type === "daily" ? "Daily challenge" : "Seasonal challenge"}
                    </div>
                    <Button asChild size="sm" variant="outline" className="font-game">
                      <Link href={`/challenges/${ch.slug}`}>Open challenge</Link>
                    </Button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <Link
        href="/challenges"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-game"
      >
        <ChevronLeft className="h-4 w-4" />
        All challenges
      </Link>

      <div className="rounded-2xl border-4 border-border bg-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1 font-game text-sm text-yellow-400">
            <Target className="h-4 w-4" />
            {challenge.type === "seasonal" ? "Seasonal" : "Daily"}
          </span>
          {challenge.xpReward > 0 && (
            <span className="font-game text-sm text-yellow-400 inline-flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              {challenge.xpReward} XP
            </span>
          )}
          {challenge.seasonName && (
            <span className="text-sm text-muted-foreground font-game">
              {challenge.seasonName}
            </span>
          )}
        </div>

        <h1 className="font-game text-2xl sm:text-3xl">{challenge.title}</h1>

        {challenge.description && (
          <p className="font-game text-muted-foreground whitespace-pre-wrap">
            {challenge.description}
          </p>
        )}

        {wallet && completed && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-game">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>You already completed this challenge and earned XP.</span>
          </div>
        )}

        {!wallet && (
          <p className="font-game text-xs text-muted-foreground">
            Connect your wallet to submit a link and complete this challenge.
          </p>
        )}

        {wallet && !completed && (
          <div className="space-y-3 pt-2">
            <Label
              htmlFor="submission-link"
              className="font-game flex items-center gap-2"
            >
              <Link2 className="h-4 w-4" />
              Submission link (required)
            </Label>
            <Input
              id="submission-link"
              type="url"
              placeholder="https://example.com/your-work"
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              className="font-game"
            />
            <p className="text-xs text-muted-foreground font-game">
              Paste a link to your work or proof (GitHub repo, CodeSandbox, screenshot, etc.). Admins
              will use this to verify your submission.
            </p>
            <Button
              variant="pixel"
              className="font-game"
              disabled={completing}
              onClick={handleComplete}
            >
              {completing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing…
                </>
              ) : (
                "Submit link & complete"
              )}
            </Button>
          </div>
        )}
      </div>

      {wallet && otherChallenges.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-game text-lg sm:text-xl">
              Your other challenges today
            </h2>
            {day && (
              <p className="font-game text-xs text-muted-foreground">Today: {day}</p>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-game text-sm text-muted-foreground">Active</h3>
              {renderSection(
                activeOthers,
                "No other active challenges. You might have completed them all."
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-game text-sm text-muted-foreground">Completed</h3>
              {renderSection(completedOthers, "No other completed challenges yet.")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

