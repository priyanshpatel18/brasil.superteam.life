"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import {
  issueCredential,
  type IssueCredentialParams as ApiParams,
} from "@/lib/services/backend-api";

export interface IssueCredentialParams extends Partial<ApiParams> {
  learner?: string;
  credentialName: string;
  metadataUri: string;
  trackCollection: string;
  courseId?: string;
  coursesCompleted?: number;
  totalXp?: number;
  /** For UX flows where duplicate issue should be treated as success (already minted). */
  allowAlreadyIssued?: boolean;
}

export function useIssueCredential() {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: IssueCredentialParams) => {
      const learner = params.learner?.trim() || publicKey?.toBase58();
      if (!learner) throw new Error("Learner wallet required");
      const result = await issueCredential({
        courseId: params.courseId ?? "test-course-1",
        learner,
        credentialName: params.credentialName,
        metadataUri: params.metadataUri,
        trackCollection: params.trackCollection,
        coursesCompleted: params.coursesCompleted ?? 1,
        totalXp: params.totalXp ?? 0,
      });
      const alreadyIssued = /CredentialAlreadyIssued/i.test(result.error ?? "");
      if (alreadyIssued && params.allowAlreadyIssued) {
        return {
          tx: result.tx ?? "",
          credentialAsset: result.credentialAsset,
          alreadyIssued: true,
        };
      }
      if (result.error) throw new Error(result.error);
      if (!result.tx) throw new Error("No transaction signature returned");
      return { tx: result.tx, credentialAsset: result.credentialAsset, alreadyIssued: false };
    },
    onSuccess: (data, params) => {
      const walletKey = publicKey?.toBase58() ?? params.learner?.trim() ?? "";
      void queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      if (walletKey) {
        void queryClient.invalidateQueries({ queryKey: ["credentials", walletKey] });
      }
      toast.success(data.alreadyIssued ? "Credential already issued." : "Credential issued.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
