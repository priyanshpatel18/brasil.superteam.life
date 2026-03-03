"use client";

import { EmptyState } from "@/components/app";
import { Input } from "@/components/ui/input";
import { useEnrollment } from "@/hooks";
import { getCompletedAtFromEnrollment } from "@/lib/lesson-bitmap";
import { getAllCourses, getCourseIdForProgram, type MockCourse } from "@/lib/services/content-service";
import { BookOpen, CheckCircle2, Gauge, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/client";
import { useEffect, useMemo, useState } from "react";

function CourseCard({ course }: { course: MockCourse }) {
    const courseId = getCourseIdForProgram(course);
    const { data: enrollment } = useEnrollment(courseId);
    const completedAt = getCompletedAtFromEnrollment(enrollment ?? undefined);
    const isCompleted = completedAt != null;

    return (
        <Link href={`/courses/${course.slug}`} className="block h-full">
            <div className="relative h-full cursor-pointer overflow-hidden rounded-2xl border-4 border-border bg-card transition-colors hover:bg-accent">
                {isCompleted && (
                    <div className="absolute top-3 right-3 z-10 p-1.5 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                )}

                {course.image && (
                    <div className="relative h-32 w-full border-b border-border bg-muted/40 sm:h-36">
                        <Image
                            src={urlFor(course.image).width(1024).height(512).url()}
                            alt={course.title}
                            width={512}
                            height={256}
                            className="h-full w-full object-cover"
                            priority={false}
                        />
                    </div>
                )}

                <div className="flex h-full flex-col p-4 font-game">
                    <div className="min-w-0">
                        <h2 className="font-game text-2xl sm:text-3xl line-clamp-2">
                            {course.title}
                        </h2>

                        <p className="mt-1 line-clamp-2 font-game text-lg sm:text-xl text-muted-foreground">
                            {course.description}
                        </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-2 sm:gap-3 pt-4">
                        <h2 className="inline-flex items-center whitespace-nowrap rounded-2xl bg-muted p-1.5 px-4 font-game text-md sm:text-lg gap-2">
                            <Gauge className="h-5 w-5" />
                            {course.difficulty}
                        </h2>

                        <span className="inline-flex items-center gap-1 whitespace-nowrap font-game text-base sm:text-lg text-muted-foreground">
                            <BookOpen className="h-5 w-5" />
                            {course.lessonCount} lessons
                        </span>

                        <span className="inline-flex items-center gap-1 whitespace-nowrap font-game text-base sm:text-lg text-yellow-400">
                            <Sparkles className="h-5 w-5" />
                            {course.lessonCount * course.xpPerLesson} XP
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function CoursesPage() {
    const [search, setSearch] = useState("");
    const [courses, setCourses] = useState<MockCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAllCourses().then((data) => {
            setCourses(data);
            setIsLoading(false);
        });
    }, []);

    const filtered = useMemo(() => {
        return courses.filter((c) => {
            const matchSearch =
                !search ||
                c.title.toLowerCase().includes(search.toLowerCase()) ||
                c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
            return matchSearch;
        });
    }, [courses, search]);

    return (
        <div className="space-y-4 sm:space-y-6">
            <h2 className="font-game text-4xl sm:text-5xl mb-2">All Courses</h2>

            {/* Search */}
            <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 text-base sm:text-lg"
                />
            </div>

            {/* Course grid */}
            {isLoading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 animate-pulse rounded-2xl border-4 border-border" />
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={BookOpen}
                    title="No courses found"
                    description="Try adjusting your search to find courses."
                />
            )}
        </div>
    );
}
