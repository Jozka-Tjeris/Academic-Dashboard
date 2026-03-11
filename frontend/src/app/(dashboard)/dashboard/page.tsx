"use client";

import { useCourses } from "@/hooks/useCourses";
import CourseCard from "@/components/course/CourseCard";

export default function DashboardPage() {
  const { data: courses, isLoading, error } = useCourses();

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Failed to load courses</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {courses?.map((course) => (
        <CourseCard key={course.courseId} course={course} />
      ))}
    </div>
  );
}
