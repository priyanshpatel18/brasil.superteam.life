"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ProfileAchievementsContent } from "@/components/app/ProfileAchievementsContent";

export default function ProfileAchievementsPage() {
  const { publicKey } = useWallet();

  if (!publicKey) return null;

  return <ProfileAchievementsContent walletAddress={publicKey.toBase58()} />;
}
