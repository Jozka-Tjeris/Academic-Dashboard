"use client";

import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCourse } from "@/hooks/useCourses";
import GradeProgress from "@/components/grade/GradeProgress";
import AddAssessmentForm from "@/components/assessment/AddAssessmentForm";
import AssessmentTable from "@/components/assessment/AssessmentTable";
import Link from "next/link";

export default function CoursePage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError } = useCourse(id);

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data) return <p>Error loading course</p>;

  const { currentGrade, maxPossibleGrade, gradeMessage } = data.gradeSummary;

  // Determine the display text for the grade
  const gradeText =
    currentGrade !== null && maxPossibleGrade !== null
      ? `${currentGrade.toFixed(1)} / ${maxPossibleGrade.toFixed(1)}`
      : gradeMessage || "N/A"; // fallback if no message

  return (
    <DashboardLayout title={data.name}>
      <p className="text-gray-600 mb-4">{data.description}</p>

      <div className="mb-6">
        <p className="mb-2 font-medium">{gradeText}</p>
        <GradeProgress value={currentGrade} max={maxPossibleGrade} />
      </div>

      <Link
        href={`/courses/${id}/simulator`}
        className="text-blue-600 hover:underline"
      >
        Open Grade Simulator
      </Link>

      <AddAssessmentForm courseId={id} />

      <AssessmentTable
        courseId={id}
        assessments={data.assessments ?? []}
      />
    </DashboardLayout>
  );
}
