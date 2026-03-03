import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";

export type NotificationItem = {
  id: number;
  wallet: string | null;
  targetRole: "admin" | "learner";
  type: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

type NotificationsResponse = {
  notifications: NotificationItem[];
  error?: string;
};

async function fetchNotifications(
  wallet: string | null | undefined
): Promise<NotificationItem[]> {
  const params = new URLSearchParams();
  if (wallet) params.set("wallet", wallet);
  params.set("role", "learner");
  const q = params.toString();
  const res = await fetch(`/api/notifications?${q}`);
  const data = (await res.json()) as NotificationsResponse;
  if (!res.ok || data.error) {
    throw new Error(data.error ?? "Failed to load notifications");
  }
  return data.notifications ?? [];
}

async function markNotificationsRead(ids: number[]): Promise<void> {
  if (!ids.length) return;
  const res = await fetch("/api/notifications?action=mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok || data.error) {
    throw new Error(data.error ?? "Failed to mark notifications as read");
  }
}

export function useNotifications() {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const queryClient = useQueryClient();

  const query = useQuery<NotificationItem[]>({
    queryKey: ["notifications", wallet ?? "anon"],
    queryFn: () => fetchNotifications(wallet),
    enabled: !!wallet,
  });

  const mutation = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications", wallet ?? "anon"],
      });
    },
  });

  return {
    ...query,
    markRead: mutation.mutate,
    markReadAsync: mutation.mutateAsync,
  };
}

