"use client";

import { useParams, useRouter } from "next/navigation";
import GradeProgress from "@/components/grade/GradeProgress";
import CreateAssessmentForm from "@/components/modal/CreateAssessmentForm";
import AssessmentTable from "@/components/assessment/AssessmentTable";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { useCourseDashboard } from "@/hooks/useDashboard";
import { MAX_GRADE } from "@internal_package/shared";
import CourseActions from "@/components/course/CourseActions";

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: dashboard, isLoading, isError: error } = useCourseDashboard(id);

  if (isLoading) return <Spinner />;

  if (error || !dashboard) {
    return <div>Failed to load course</div>;
  }

  const { currentGrade, gradeMessage } = dashboard.course.gradeSummary;

  const gradeText =
    currentGrade !== null
      ? `${(currentGrade * MAX_GRADE).toFixed(2)} / ${MAX_GRADE.toFixed(2)}`
      : gradeMessage || "N/A";

  return (
    <div className="space-y-8">
      {/* Course header */}
      <div className="flex items-start justify-between">

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

        <CourseActions
          course={dashboard.course}
          variant="inline"
          onDeleted={() => router.push("/dashboard")}
        />
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

      <Link
        href={`/courses/${id}/analytics`}
        className="text-blue-600 hover:underline"
      >
        Open Course Analytics
      </Link>

      <CreateAssessmentForm courseId={id} />

      <AssessmentTable
        assessments={dashboard.workload.upcomingAssessments ?? []}
      />
    </div>
  );
}
