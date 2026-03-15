"use client";

import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { useCourseAnalytics } from "@/hooks/useAnalytics";
import AssessmentTable from "@/components/assessment/AssessmentTable";

export default function CourseAnalyticsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data, isLoading, isError } = useCourseAnalytics(courseId);

  if (isLoading) return <Spinner />;

  if (isError || !data) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Course Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Insights about workload, grades, and upcoming assessments.
        </p>
      </div>

      {/* Grade Overview */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Grade Overview</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <p className="text-sm text-muted-foreground">Current Grade</p>
            <p className="text-xl font-semibold">
              {data.currentGrade !== null
                ? `${(data.currentGrade * 100).toFixed(2)}%`
                : "N/A"}
            </p>
          </div>

          <div className="p-4 border rounded">
            <p className="text-sm text-muted-foreground">Max Possible Grade</p>
            <p className="text-xl font-semibold">
              {data.maxPossibleGrade !== null
                ? `${(data.maxPossibleGrade * 100).toFixed(2)}%`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Status Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Assessment Breakdown</h2>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total" value={data.assessmentCounts.total} />

          <StatCard label="Submitted" value={data.assessmentCounts.submitted} />

          <StatCard label="Graded" value={data.assessmentCounts.graded} />

          <StatCard label="Pending" value={data.assessmentCounts.pending} />

          <StatCard
            label="Due in 24 Hours"
            value={data.assessmentCounts.in24hrs}
          />

          <StatCard label="Overdue" value={data.assessmentCounts.overdue} />
        </div>
      </div>

      {/* Urgency Metrics */}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Workload Metrics</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <p className="text-sm text-muted-foreground">Total Urgency</p>
            <p className="text-xl font-semibold">
              {data.urgency.totalUrgency.toFixed(2)}
            </p>
          </div>

          <div className="p-4 border rounded">
            <p className="text-sm text-muted-foreground">Average Urgency</p>
            <p className="text-xl font-semibold">
              {data.urgency.averageUrgency.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Most Urgent Assessments */}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Most Urgent Assessments</h2>

        <AssessmentTable assessments={data.urgency.topAssessments} />
      </div>
    </div>
  );
}

/* Simple reusable stat card */
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 border rounded">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
