"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/** Ensure newlines are real so markdown block elements (# headings, - lists) parse correctly. */
function normalizeNewlines(s: string): string {
  return s.replace(/\\n/g, "\n").trim();
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const normalized = normalizeNewlines(content);
  return (
    <div
      className={cn(
        "prose prose-base sm:prose-lg max-w-none text-foreground dark:prose-invert",
        "prose-headings:font-game prose-headings:tracking-normal",
        "prose-p:font-sans prose-p:leading-7 prose-p:text-[1.03rem]",
        "prose-li:font-sans prose-li:leading-7 prose-li:text-[1.02rem]",
        "prose-strong:font-semibold prose-code:font-mono prose-code:text-[0.95em]",
        "prose-pre:font-mono prose-pre:text-sm prose-a:text-yellow-500 hover:prose-a:text-yellow-400",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalized}</ReactMarkdown>
    </div>
  );
}
