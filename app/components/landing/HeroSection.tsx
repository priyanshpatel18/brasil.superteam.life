"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative w-full min-h-screen bg-background p-3 sm:p-5">
            <div className="relative h-[calc(100vh-1.5rem)] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:h-[calc(100vh-2.5rem)] sm:rounded-3xl">
                <div className="mb-3 inline-block sm:mb-4">
                    <div className="relative overflow-hidden rounded-full shadow-[0_0_12px_rgba(0,0,0,0.15)] dark:shadow-[0_0_12px_rgba(255,255,255,0.1)]" style={{ padding: '1px 1.5px' }}>
                    </div>
                </div>

                <Image
                    src="/hero.gif"
                    alt="Superteam Academy hero background"
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/55" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,18,0.3)_62%,rgba(1,3,10,0.65)_100%)]" />

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center sm:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                    >
                        {/* Inner badge content */}
                        <div className="relative z-10 inline-flex items-center gap-1.5 rounded-full bg-background px-6 py-2">
                            <span className="glow-text font-game  text-[12px] font-medium text-brand-black dark:text-brand-cream/80">Powered by Solana</span>
                            {/* Solana logo — filtered dark for light mode, native white for dark */}
                            <Image
                                src="/solanaLogo.png"
                                alt="Solana"
                                width={72}
                                height={16}
                                className="h-3 w-auto brightness-0 dark:hidden"
                            />
                            <Image
                                src="/solanaLogo.png"
                                alt="Solana"
                                width={72}
                                height={16}
                                className="hidden h-3 w-auto dark:block"
                            />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="font-game text-4xl font-bold leading-[1.05] text-white sm:text-6xl md:text-7xl lg:text-8xl"
                    >
                        Master <span className="text-yellow-400">Solana</span>
                        <br />
                        Development
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="mt-5 max-w-3xl font-game text-base text-white/70 sm:text-xl md:text-2xl"
                    >
                        Hands-on courses, soulbound credentials, daily challenges, and real-world projects.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.38 }}
                        className="mt-8 sm:mt-10"
                    >
                        <Link href="/courses/intro-to-solana">
                            <Button
                                variant="pixel"
                                className="animate-glow-pulse px-8 py-6 text-xl font-game sm:px-10 sm:text-2xl"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
