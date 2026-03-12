"use client";

import UrgencyHeatBar from "@/components/dashboard/UrgencyHeatBar";
import { getStatusColor } from "@/lib/statusColor";
import { AssessmentShared } from "@internal_package/shared";

type AssessmentRow = AssessmentShared & {
  urgency?: number;
}

export default function AssessmentTable({ assessments }: {
  assessments: AssessmentRow[]
}) {
  if (assessments.length === 0) {
    return (
      <div className="text-muted-foreground">
        No assessments yet
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">

      <table className="w-full text-sm">

        <thead className="bg-muted">
          <tr className="text-left">
            <th className="p-3">Urgency</th>
            <th className="p-3">Title</th>
            <th className="p-3">Weight</th>
            <th className="p-3">Score</th>
            <th className="p-3">Due Date</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {assessments.map(a => (
            <tr
              key={a.assessmentId}
              className="border-t hover:bg-muted/40"
              onClick={() => window.location.href=`/assessments/${a.assessmentId}`}
            >
              <td className="p-3">
                {a.urgency ? (
                  <UrgencyHeatBar
                  urgency={a.urgency}
                  weight={a.weight}
                />
                ) : (
                  "-"
                )}
              </td>

              <td className="p-3 font-medium">
                {a.title}
              </td>

              <td className="p-3">
                {(a.weight * 100).toFixed(0)}%
              </td>

              <td className="p-3">
                {a.score !== null && a.maxScore
                  ? `${a.score}/${a.maxScore}`
                  : "—"}
              </td>

              <td className="p-3">
                {new Date(a.dueDate).toLocaleDateString()}
              </td>

              <td className={`p-3 ${getStatusColor(a.status)}`}>
                {a.status}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
