"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const FEATURES = [
    {
        title: "Talent Leaderboard",
        desc: "Track XP rankings and see where you stand against top community builders.",
        span: "md:col-span-1",
    },
    {
        title: "Timed Coding Challenges",
        desc: "Solve practical Solana coding problems with in-browser execution and instant feedback.",
        span: "md:col-span-1",
    },
    {
        title: "Community Discussions",
        desc: "Ask questions, post solutions, and collaborate with other learners in one feed.",
        span: "md:col-span-1",
    },
    {
        title: "Profile & Credentials",
        desc: "Showcase progress, XP, and on-chain learning credentials in your public profile.",
        span: "md:col-span-1",
    },
    {
        title: "Achievements & Badges",
        desc: "Unlock milestone badges for consistency, course completion, and community impact.",
        span: "md:col-span-1",
    },
    {
        title: "On-Chain Credentials",
        desc: "Earn verifiable course credentials tied to your wallet as proof of completed learning.",
        span: "md:col-span-1",
    },
];

export function FeaturesSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section className="w-full py-16 sm:py-24 bg-background">
            <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="mb-10 sm:mb-14 text-center"
                >
                    <p className="mb-2 font-game text-base sm:text-lg tracking-widest text-muted-foreground uppercase">
                        Everything you need
                    </p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-game leading-tight">
                        Everything you need to master Solana.
                    </h2>
                </motion.div>

                {/* Feature grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
                    {FEATURES.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 24 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                                duration: 0.5,
                                delay: 0.08 * i,
                                ease: "easeOut",
                            }}
                            className={`relative rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/30 sm:p-6 ${feature.span}`}
                        >
                            {/* Text content */}
                            <h3 className="mb-1.5 font-game text-xl text-foreground sm:text-2xl">
                                {feature.title}
                            </h3>
                            <p className="font-game text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
