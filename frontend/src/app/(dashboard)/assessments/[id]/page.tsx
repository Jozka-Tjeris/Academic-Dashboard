"use client";

import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { useAssessment } from "@/hooks/useAssessments";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/statusColor";
import { AssessmentStatusMetadata } from "@internal_package/shared";
import AssessmentActions from "@/components/assessment/AssessmentActions";

export default function AssessmentPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data, isLoading, isError } = useAssessment(id);

  if (isLoading) return <Spinner />;
  if (isError || !data) return <div>Failed to load assessment</div>;

  const assessment = data.assessment;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{assessment.title}</h1>
          <Badge className={getStatusColor(assessment.status)}
          style={{backgroundColor: "white", borderColor: "black"}}>
            {AssessmentStatusMetadata[assessment.status].label}
          </Badge>
        </div>

        <AssessmentActions
          assessment={assessment}
          variant="inline"
          onDeleted={() => router.push(`/courses/${assessment.courseId}`)}
        />
      </div>

      {/* Metadata block */}
      <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/10">
        <div>
          <p className="text-sm text-muted-foreground">Course</p>
          <button
            onClick={() => router.push(`/courses/${assessment.courseId}`)}
            className="hover:underline rounded-md border py-1 px-2 text-blue-600 cursor-pointer"
          >
            {data.course.name}
          </button>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Weight</p>
          <p>{(assessment.weight * 100).toFixed(0)}%</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Due Date</p>
          <p>{new Date(assessment.dueDate).toLocaleDateString()}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Submission Date</p>
          <p>{assessment.submissionDate ? new Date(assessment.submissionDate).toLocaleDateString(): "N/A"}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Score</p>
          <p>{assessment.score ?? "Not graded"}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Max Score</p>
          <p>{assessment.maxScore}</p>
        </div>
      </div>

      {/* Description */}
      {assessment.description && (
        <p className="text-muted-foreground">{assessment.description}</p>
      )}
    </div>
  );
}
