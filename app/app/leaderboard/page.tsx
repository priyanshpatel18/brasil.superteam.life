"use client";

import { AppShell } from "@/components/app/AppShell";
import { LeaderboardContent } from "@/components/app/LeaderboardContent";
import { useWallet } from "@solana/wallet-adapter-react";

/**
 * Public leaderboard at /leaderboard.
 * When logged in: sidebar + app header (no top navbar).
 * When logged out: top navbar only (like public profile).
 */
export default function LeaderboardPage() {
    const { connected } = useWallet();

    if (connected) {
        return (
            <AppShell>
                <LeaderboardContent />
            </AppShell>
        );
    }

    return <LeaderboardContent />;
}
