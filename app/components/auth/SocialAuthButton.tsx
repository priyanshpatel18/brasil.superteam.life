"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Github, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProviderAvailability {
  google: boolean;
  github: boolean;
}

export function SocialAuthButton({ compact = false }: { compact?: boolean }) {
  const { data: session } = useSession();
  const [providers, setProviders] = useState<ProviderAvailability>({
    google: false,
    github: false,
  });

  useEffect(() => {
    let cancelled = false;
    const loadProviders = async () => {
      try {
        const res = await fetch("/api/auth/providers", {
          method: "GET",
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as
          | Record<string, { id?: string }>
          | { error?: string };
        if (!res.ok || cancelled) return;
        const ids = Object.values(data)
          .map((provider) =>
            provider && typeof provider === "object" && "id" in provider
              ? String(provider.id ?? "")
              : ""
          )
          .filter(Boolean);
        setProviders({
          google: ids.includes("google"),
          github: ids.includes("github"),
        });
      } catch {
        // Ignore; no provider buttons shown.
      }
    };
    void loadProviders();
    return () => {
      cancelled = true;
    };
  }, []);

  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") return "/";
    return window.location.href;
  }, []);

  if (session?.user) {
    const label = session.user.name?.trim() || session.user.email?.trim() || "Signed in";
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        className={cn("font-game", compact ? "text-sm px-2.5" : "text-base")}
        onClick={() => void signOut({ callbackUrl: "/" })}
        title={label}
      >
        <LogOut className="h-4 w-4" />
        {!compact && <span className="max-w-[140px] truncate">{label}</span>}
      </Button>
    );
  }

  if (!providers.google && !providers.github) return null;

  return (
    <div className={cn("flex items-center", compact ? "gap-1" : "gap-2")}>
      {providers.google && (
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn("font-game", compact ? "text-xs px-2" : "text-sm")}
          onClick={() => void signIn("google", { callbackUrl })}
        >
          Google
        </Button>
      )}
      {providers.github && (
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn("font-game", compact ? "text-xs px-2" : "text-sm")}
          onClick={() => void signIn("github", { callbackUrl })}
        >
          <Github className="h-3.5 w-3.5" />
          {!compact && <span>GitHub</span>}
        </Button>
      )}
    </div>
  );
}
