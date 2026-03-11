"use client";

import { useCourses } from "@/hooks/useCourses";
import CourseCard from "@/components/course/CourseCard";
import { Spinner } from "@/components/ui/Spinner";
import UpcomingAssessments from "@/components/dashboard/UpcomingAssessments";
import UrgentAssessments from "@/components/dashboard/UrgentAssessments";
import CollisionAlerts from "@/components/dashboard/CollisionAlerts";

export default function DashboardPage() {
  const { data: courses, isLoading, error } = useCourses();

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="text-red-500">
        Failed to load courses
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Risk widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UrgentAssessments courses={courses ?? []} />
        <UpcomingAssessments courses={courses ?? []} />
      </div>

      {/* Courses */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Courses
        </h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses?.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>
      </section>

      {/* Collisions */}
      <CollisionAlerts />

    </div>
  );
}
