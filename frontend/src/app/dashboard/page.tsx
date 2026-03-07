"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCourses } from "@/hooks/useCourses";
import CourseCard from "@/components/course/CourseCard";
import CourseFormModal from "@/components/course/CourseFormModal";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { data, isLoading, isError } = useCourses();
  const [open, setOpen] = useState(false);

  return (
    <DashboardLayout title="Dashboard">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Your Courses</h2>
        <Button onClick={() => setOpen(true)}>+ Add Course</Button>
      </div>

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

      <CourseFormModal open={open} onClose={() => setOpen(false)} />
    </DashboardLayout>
  );
}