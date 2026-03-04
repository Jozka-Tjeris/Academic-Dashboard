"use client";

import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCourse } from "@/hooks/useCourses";
import GradeProgress from "@/components/grade/GradeProgress";

export default function CoursePage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError } = useCourse(id);

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data) return <p>Error loading course</p>;

  const { currentGrade, maxPossibleGrade } = data.gradeSummary;

  return (
    <DashboardLayout title={data.name}>
      <p className="text-gray-600 mb-4">{data.description}</p>

      <div className="mb-6">
        <p className="mb-2 font-medium">
          {currentGrade.toFixed(1)} / {maxPossibleGrade.toFixed(1)}
        </p>
        <GradeProgress value={currentGrade} max={maxPossibleGrade} />
      </div>

      {/* Assessment table will go here next */}
    </DashboardLayout>
  );
}