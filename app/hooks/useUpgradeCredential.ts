"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import {
  upgradeCredential,
  type UpgradeCredentialParams as ApiParams,
} from "@/lib/services/backend-api";

export interface UpgradeCredentialParams extends Partial<ApiParams> {
  learner?: string;
  credentialAsset: string;
  credentialName: string;
  metadataUri: string;
  trackCollection: string;
  courseId?: string;
  coursesCompleted?: number;
  totalXp?: number;
}

export function useUpgradeCredential() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpgradeCredentialParams) => {
      const learner = params.learner?.trim() || publicKey?.toBase58();
      if (!learner) throw new Error("Learner wallet required");
      const result = await upgradeCredential({
        courseId: params.courseId ?? "test-course-1",
        learner,
        credentialAsset: params.credentialAsset,
        credentialName: params.credentialName,
        metadataUri: params.metadataUri,
        trackCollection: params.trackCollection,
        coursesCompleted: params.coursesCompleted ?? 1,
        totalXp: params.totalXp ?? 0,
      });
      if (result.error) throw new Error(result.error);
      return result.tx!;
    },
    onSuccess: (_, params) => {
      const walletKey = publicKey?.toBase58() ?? params.learner?.trim() ?? "";
      void queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      if (walletKey) {
        void queryClient.invalidateQueries({ queryKey: ["credentials", walletKey] });
      }
      toast.success("Credential upgraded.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
