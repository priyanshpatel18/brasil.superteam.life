"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { AppShell } from "@/components/app/AppShell";

/**
 * Challenges layout.
 * When logged in: sidebar + app header (same chrome as (app)/courses).
 * When logged out: top navbar layout only.
 */
export default function ChallengesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connected } = useWallet();

  if (connected) {
    return <AppShell>{children}</AppShell>;
  }

  return <>{children}</>;
}
