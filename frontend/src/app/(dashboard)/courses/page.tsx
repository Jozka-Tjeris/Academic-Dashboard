"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useCourses } from "@/hooks/useCourses";
import CourseCard from "@/components/course/CourseCard";

export default function CoursesPage() {
  const { data: courses, isLoading, isError: error } = useCourses();

  if (isLoading) return <Spinner />;

  if (error || !courses) {
    return <div>Failed to load courses</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((c) => 
        <CourseCard key={c.courseId} course={c} />
      )}
    </div>
  );
}
