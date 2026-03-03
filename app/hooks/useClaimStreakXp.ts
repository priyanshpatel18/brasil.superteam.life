"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";

/** Claims daily streak XP for the connected wallet via the BFF.
 *  Frontend calls /api/xp/streak; BFF calls backend /v1/academy/reward-xp
 *  using the configured backend signer and API token. */
export function useClaimStreakXp() {
    const { publicKey } = useWallet();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (amount: number) => {
            const wallet = publicKey?.toBase58();
            if (!wallet) throw new Error("Wallet not connected");
            const res = await fetch("/api/xp/streak", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet, amount }),
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string; tx?: string };
            if (!res.ok || data.error) {
                throw new Error(data.error ?? res.statusText ?? "Failed to claim streak XP");
            }
            return data.tx;
        },
        onSuccess: () => {
            const wallet = publicKey?.toBase58() ?? "";
            void queryClient.invalidateQueries({ queryKey: ["xpBalance", wallet] });
        },
    });
}

