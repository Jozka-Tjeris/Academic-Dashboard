"use client";

import { useParams } from "next/navigation";
import { useCourse } from "@/hooks/useCourses";
import GradeProgress from "@/components/grade/GradeProgress";
import AddAssessmentForm from "@/components/assessment/AddAssessmentForm";
import AssessmentTable from "@/components/assessment/AssessmentTable";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";

export default function CoursePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: course, isLoading, isError: error } = useCourse(id);

  if (isLoading) return <Spinner />;

  if (error || !course) {
    return <div>Failed to load course</div>;
  }

  const { currentGrade, maxPossibleGrade, gradeMessage } = course.gradeSummary;

  // Determine the display text for the grade
  const gradeText =
    currentGrade !== null && maxPossibleGrade !== null
      ? `${currentGrade.toFixed(1)} / ${maxPossibleGrade.toFixed(1)}`
      : gradeMessage || "N/A"; // fallback if no message

  return (
    <div className="space-y-8">
      {/* Course header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {course.name}
        </h1>

        {course.description && (
          <p className="text-muted-foreground">
            {course.description}
          </p>
        )}
      </div>

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
        assessments={course.assessments ?? []}
      />
    </div>
  );
}
