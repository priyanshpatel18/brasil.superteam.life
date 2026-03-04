import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl border-4 bg-card p-8 sm:p-10">
        <WifiOff className="mx-auto h-12 w-12 text-yellow-400" />
        <h1 className="mt-4 font-game text-4xl sm:text-5xl">You&apos;re Offline</h1>
        <p className="mt-2 font-game text-muted-foreground">
          Saved lessons remain available. Reconnect to load new course content.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Button asChild variant="pixel" className="font-game">
            <Link href="/courses">Open Courses</Link>
          </Button>
          <Button asChild variant="outline" className="font-game">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
