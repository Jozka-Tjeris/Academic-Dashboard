"use client";

import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { useAssessment } from "@/hooks/useAssessments";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/statusColor";
import { AssessmentStatusMetadata } from "@internal_package/shared";

export default function AssessmentPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError } = useAssessment(id);

  if (isLoading) return <Spinner />;

  if (isError || !data) {
    return <div>Failed to load assessment</div>;
  }

  const assessment = data.assessment;

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-semibold">{assessment.title}</h1>

        <Badge className={getStatusColor(assessment.status)}
        style={{backgroundColor: "white", borderColor: "black"}}>
          {AssessmentStatusMetadata[assessment.status].label}
        </Badge>
      </div>

      {assessment.description && (
        <p className="text-muted-foreground">
          {assessment.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">

        <div>
          <p className="text-sm text-muted-foreground">Weight</p>
          <p>{assessment.weight}%</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Due Date</p>
          <p>{new Date(assessment.dueDate).toLocaleDateString()}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Score</p>
          <p>{assessment.score ?? "Not graded"}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Max Score</p>
          <p>{assessment.maxScore ?? "-"}</p>
        </div>

      </div>

    </div>
  );
}
