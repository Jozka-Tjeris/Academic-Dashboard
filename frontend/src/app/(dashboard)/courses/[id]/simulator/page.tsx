"use client";

import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { useCourse } from "@/hooks/useCourses";
import SimulatorTable from "@/components/simulator/SimulatorTable";

export default function SimulatorPage() {

  const params = useParams();
  const courseId = params.id as string;

  const { data: course, isLoading, isError } = useCourse(courseId);

  if (isLoading) return <Spinner />;

  if (isError || !course) {
    return <div>Failed to load course</div>;
  }

  return (
    <div className="space-y-6 h-full">

      <h1 className="text-2xl font-semibold h-8">
        {course.name} - Grade Simulator
      </h1>

      <SimulatorTable
        courseId={courseId}
        assessments={course.assessments ?? []}
        currentGrade={course.gradeSummary.currentGrade}
      />

    </div>
  );
}
