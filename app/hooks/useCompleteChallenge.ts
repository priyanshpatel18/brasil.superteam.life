import { useMutation, useQueryClient } from "@tanstack/react-query";

async function completeChallenge(
  challengeId: number,
  wallet: string,
  submissionLink?: string
): Promise<{ ok: boolean; completedAt?: string; alreadyCompleted?: boolean }> {
  const res = await fetch(`/api/challenges/${challengeId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet,
      ...(submissionLink !== undefined && submissionLink !== "" && { submissionLink }),
    }),
  });
  const data = (await res.json()) as {
    ok?: boolean;
    completedAt?: string;
    alreadyCompleted?: boolean;
    error?: string;
  };
  if (!res.ok || data.error) {
    throw new Error(data.error ?? "Failed to complete challenge");
  }
  return {
    ok: data.ok ?? true,
    completedAt: data.completedAt,
    alreadyCompleted: data.alreadyCompleted,
  };
}

export function useCompleteChallenge(wallet: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      challengeId,
      submissionLink,
    }: {
      challengeId: number;
      submissionLink?: string;
    }) => {
      if (!wallet) throw new Error("Wallet not connected");
      return completeChallenge(challengeId, wallet, submissionLink);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}
