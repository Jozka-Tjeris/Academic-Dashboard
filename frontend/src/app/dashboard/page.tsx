"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCourses } from "@/hooks/useCourses";
import CourseCard from "@/components/course/CourseCard";

export default function DashboardPage() {
  const { data, isLoading, isError } = useCourses();

  return (
    <DashboardLayout title="Dashboard">
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error loading courses</p>}

      {data && data.length === 0 && (
        <p className="text-gray-500">No courses yet.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((course) => (
          <CourseCard key={course.courseId} course={course} />
        ))}
      </div>
    </DashboardLayout>
  );
}