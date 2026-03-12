"use client";

import UrgencyHeatBar from "@/components/dashboard/UrgencyHeatBar";
import { getStatusColor } from "@/lib/statusColor";
import { AssessmentWithUrgency } from "@/types/dashboard";

export default function AssessmentTable({ assessments }: {
  assessments: AssessmentWithUrgency[]
}) {
  if (assessments.length === 0) {
    return (
      <div className="text-muted-foreground">
        No assessments yet
      </div>
    );
  }

  const sorted = [...assessments].sort(
    (a, b) => (b.urgency ?? 0) - (a.urgency ?? 0)
  );

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

          {sorted.map(a => (
            <tr
              key={a.assessmentId}
              className="border-t hover:bg-muted/40"
            >
              <td className="p-3">
                <UrgencyHeatBar
                  urgency={a.urgency ?? 0}
                  weight={a.weight ?? 0}
                />
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
