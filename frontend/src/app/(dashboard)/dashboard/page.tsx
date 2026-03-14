"use client";

import CourseCard from "@/components/course/CourseCard";
import { Spinner } from "@/components/ui/Spinner";
import UpcomingAssessments from "@/components/dashboard/UpcomingAssessments";
import UrgentAssessments from "@/components/dashboard/UrgentAssessments";
import CollisionAlerts from "@/components/dashboard/CollisionAlerts";
import { useUserDashboard } from "@/hooks/useDashboard";
import CreateCourseForm from "@/components/modal/CreateCourseForm";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { data: dashboard, isLoading, error } = useUserDashboard();
  const [open, setOpen] = useState(false);

  if (isLoading) return <Spinner />;

  if (error || !dashboard) {
    return (
      <div className="text-red-500">
        Failed to load dashboard
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Risk widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UrgentAssessments assessments={dashboard.workload.upcomingAssessments ?? []} />
        <UpcomingAssessments assessments={dashboard.workload.upcomingAssessments ?? []} />
      </div>

      {/* Courses */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Courses
          </h2>
          <Button onClick={() => setOpen(true)} className="cursor-pointer">+ Add Course</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.courses.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>
      </section>

      {/* Collisions */}
      <CollisionAlerts />

      <CreateCourseForm open={open} onClose={() => setOpen(false)}/>
    </div>
  );
}
