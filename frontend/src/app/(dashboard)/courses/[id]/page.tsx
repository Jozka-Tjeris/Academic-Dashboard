"use client";

import { useParams } from "next/navigation";
import GradeProgress from "@/components/grade/GradeProgress";
import CreateAssessmentForm from "@/components/modal/CreateAssessmentForm";
import AssessmentTable from "@/components/assessment/AssessmentTable";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { useCourseDashboard } from "@/hooks/useDashboard";
import { MAX_GRADE } from "@internal_package/shared";

export default function CoursePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: dashboard, isLoading, isError: error } = useCourseDashboard(id);

  if (isLoading) return <Spinner />;

  if (error || !dashboard) {
    return <div>Failed to load course</div>;
  }

  const { currentGrade, gradeMessage } = dashboard.course.gradeSummary;

  // Determine the display text for the grade
  const gradeText =
    currentGrade !== null
      ? `${(currentGrade * MAX_GRADE).toFixed(2)} / ${(MAX_GRADE).toFixed(2)}`
      : gradeMessage || "N/A"; // fallback if no message

  return (
    <div className="space-y-8">
      {/* Course header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {dashboard.course.name}
        </h1>

        {dashboard.course.description && (
          <p className="text-muted-foreground">
            {dashboard.course.description}
          </p>
        )}
      </div>

      <div className="mb-6">
        <p className="mb-2 font-medium">{gradeText}</p>
        <GradeProgress value={currentGrade} max={1} />
      </div>

      <Link
        href={`/courses/${id}/simulator`}
        className="text-blue-600 hover:underline"
      >
        Open Grade Simulator
      </Link>

      <CreateAssessmentForm courseId={id} />

      <AssessmentTable
        assessments={dashboard.workload.upcomingAssessments ?? []}
      />
    </div>
  );
}
