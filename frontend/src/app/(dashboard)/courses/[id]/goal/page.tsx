"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useCourse } from "@/hooks/useCourses";
import { useCalculateCourseGradeGoal } from "@/hooks/useCourses";

interface RequiredScoreRow {
  assessmentId: string;
  requiredScore: number;
  title: string;
}

export default function TargetGradeCalculatorPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [targetGradeInput, setTargetGradeInput] = useState<number>(85);
  const [requiredScores, setRequiredScores] = useState<RequiredScoreRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const { data: course, isLoading, isError } = useCourse(courseId); 
  const mutation = useCalculateCourseGradeGoal(courseId);

  if (isLoading) return <Spinner />;

  if (isError || !course) {
    return <div>Failed to load course goal calculator</div>;
  }

  const handleSubmit = async () => {
    setMessage(null);
    setRequiredScores([]);

    try {
      const response = await mutation.mutateAsync(targetGradeInput / 100);

      if (response.possible) {
        const mappedScores: RequiredScoreRow[] = response.requiredScores?.map((rs: any) => {
          const assessment = course?.assessments?.find((a: any) => a.assessmentId === rs.assessmentId);
          return {
            ...rs,
            title: assessment?.title ?? rs.assessmentId,
          };
        }) ?? [];

        setRequiredScores(mappedScores);

        if (response.averageRequiredPercent !== undefined) {
          setMessage(`Average required score across assessments:
            ${(response.averageRequiredPercent * 100).toFixed(2)}%`);
        }
      } else {
        setMessage(response.message ?? "Target grade impossible");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error calculating target grade");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{course?.name} - Target Grade Calculator</h1>

      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Target Grade (%)</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={targetGradeInput ?? ""}
            onChange={(e) => setTargetGradeInput(parseFloat(e.target.value))}
          />
        </div>

        <Button onClick={handleSubmit} disabled={mutation.isPending || !targetGradeInput}>
          {mutation.isPending ? "Calculating..." : "Calculate"}
        </Button>
      </div>

      {message && (
        <Alert className="mt-2">
          <AlertTitle>{requiredScores.length > 0 ? "Goal Achievable" : "Goal Not Achievable"}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {requiredScores.length > 0 && (
        <div className="mt-4 border rounded p-4">
          <h2 className="text-xl font-medium mb-2">Required Scores</h2>
          <table className="w-full text-sm table-auto border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Assessment</th>
                <th className="p-2 text-right">Required Score</th>
              </tr>
            </thead>
            <tbody>
              {requiredScores.map((row) => (
                <tr key={row.assessmentId} className="border-b hover:bg-muted/20">
                  <td className="p-2">{row.title}</td>
                  <td className="p-2 text-right">{row.requiredScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {mutation.data?.nextAssessmentRequiredScore !== undefined && (
            <p className="mt-2 text-sm text-muted-foreground">
              Next assessment required score: {mutation.data.nextAssessmentRequiredScore.toFixed(2)}%
            </p>
          )}
        </div>
      )}

      {!mutation.isPending && requiredScores.length === 0 && !message && (
        <p className="text-muted-foreground">
          Enter a target grade and click "Calculate" to see required scores.
        </p>
      )}
    </div>
  );
}
