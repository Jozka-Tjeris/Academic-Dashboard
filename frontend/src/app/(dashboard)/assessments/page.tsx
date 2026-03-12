"use client";

import AssessmentTable from "@/components/assessment/AssessmentTable";
import { useAllAssessments } from "@/hooks/useAllAssessments";
import { Spinner } from "@/components/ui/Spinner";

export default function AssessmentsPage() {
  const { assessments, isLoading, isError } = useAllAssessments();

  if (isLoading) return <Spinner />;

  if (isError) {
    return <div>Failed to load assessments</div>;
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">
        All Assessments
      </h1>

      <AssessmentTable assessments={assessments} />

    </div>
  );
}
