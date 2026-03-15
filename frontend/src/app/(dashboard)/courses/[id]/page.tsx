"use client";

import { useParams, useRouter } from "next/navigation";
import GradeProgress from "@/components/grade/GradeProgress";
import CreateAssessmentForm from "@/components/modal/CreateAssessmentForm";
import AssessmentTable from "@/components/assessment/AssessmentTable";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { useCourseDashboard } from "@/hooks/useDashboard";
import { AssessmentStatusMetadata } from "@internal_package/shared";
import CourseActions from "@/components/course/CourseActions";
import CollisionAlerts from "@/components/dashboard/CollisionAlerts";

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: dashboard, isLoading, isError } = useCourseDashboard(id);

  if (isLoading) return <Spinner />;

  if (isError || !dashboard) {
    return <div>Failed to load course</div>;
  }

  const { currentGrade, gradeMessage } = dashboard.course.gradeSummary;
  const stats = dashboard.workload.stats;

  const gradeText =
    currentGrade !== null
      ? `${(currentGrade * 100).toFixed(2)} / ${100}`
      : gradeMessage || "N/A";

  return (
    <div className="space-y-10">
      {/* Course Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{dashboard.course.name}</h1>

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

      {/* Grade Overview */}

      <div className="space-y-2">
        <p className="font-medium">{gradeText}</p>
        <GradeProgress value={currentGrade} max={1} />
      </div>

      {/* Quick Tools */}

      <div className="flex gap-4">
        <Link
          href={`/courses/${id}/simulator`}
          className="bg-blue-600 text-white font-medium py-1 px-2 rounded-md"
        >
          Grade Simulator
        </Link>

        <Link
          href={`/courses/${id}/analytics`}
          className="bg-green-600 text-white font-medium py-1 px-2 rounded-md"
        >
          Course Analytics
        </Link>

        <Link
          href={`/courses/${id}/goal`}
          className="bg-yellow-500 text-white font-medium py-1 px-2 rounded-md"
        >
          Goal Calculator
        </Link>

        {/* Create Assessment */}

        <CreateAssessmentForm courseId={id} />
      </div>

      {/* Workload Stats */}

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Due in 7 Days" value={stats.dueNext7Days} />

        <StatCard label="Due in 14 Days" value={stats.dueNext14Days} />

        <StatCard
          label="Upcoming Weight"
          value={`${(stats.totalUpcomingWeight * 100).toFixed(0)}%`}
        />
      </div>

      {/* Busiest Week */}

      {stats.highestWeightUpcoming && (
        <StatCard 
          label="Highest urgency assessment"
          value={stats.highestWeightUpcoming.title + " (" + 
            AssessmentStatusMetadata[stats.highestWeightUpcoming.status].label
            + ")"
          }
        />
      )}

      {/* Busiest Week */}

      {stats.busiestWeek && (
        <div className="p-4 border rounded">
          <p className="text-sm text-muted-foreground">Busiest Week</p>

          <p className="font-semibold">
            {new Date(stats.busiestWeek.start).toLocaleDateString()}
            {" - "}
            {new Date(stats.busiestWeek.end).toLocaleDateString()}
          </p>

          <p className="text-sm text-muted-foreground">
            {stats.busiestWeek.assessmentCount} assessments due
          </p>
        </div>
      )}

      <CollisionAlerts clusters={dashboard.collisions} />

      {/* Upcoming Assessments */}

      <AssessmentTable
        assessments={dashboard.course.assessments ?? []}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 border rounded">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
