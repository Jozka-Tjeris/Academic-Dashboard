"use client";

import { AssessmentShared } from "@internal_package/shared";
import EditableScore from "./EditableScore";
import { useDeleteAssessment } from "@/hooks/useAssessments";
import { Button } from "@/components/ui/Button";

interface AssessmentTableProps {
  assessments: AssessmentShared[];
  courseId: string;
}

export default function AssessmentTable({ assessments, courseId }: AssessmentTableProps) {
  const { mutate: deleteAssessment } = useDeleteAssessment(courseId);

  if (!assessments.length) {
    return <p className="text-gray-500">No assessments yet.</p>;
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left p-3">Title</th>
            <th className="text-left p-3">Due Date</th>
            <th className="text-left p-3">Weight</th>
            <th className="text-left p-3">Score</th>
            <th className="text-left p-3">Max</th>
            <th className="text-left p-3">Status</th>
            <th className="text-right p-3"></th>
          </tr>
        </thead>

        <tbody>
          {assessments.map((a) => (
            <tr key={a.assessmentId} className="border-b">
              <td className="p-3">{a.title}</td>

              <td className="p-3">
                {new Date(a.dueDate).toLocaleDateString()}
              </td>

              <td className="p-3">{a.weight}%</td>

              <td className="p-3">
                <EditableScore
                  assessment={a}
                  courseId={courseId}
                />
              </td>

              <td className="p-3">{a.maxScore ?? "-"}</td>

              <td className="p-3">{a.status}</td>

              <td className="p-3 text-right">
                <Button
                  variant="destructive"
                  onClick={() =>
                    deleteAssessment(a.assessmentId)
                  }
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
