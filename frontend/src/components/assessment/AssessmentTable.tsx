"use client";

import { useState } from "react";
import UrgencyHeatBar from "@/components/dashboard/UrgencyHeatBar";
import { getStatusColor } from "@/lib/statusColor";
import { AssessmentShared, AssessmentStatusMetadata } from "@internal_package/shared";
import EditAssessmentForm from "@/components/modal/EditAssessmentForm";
import DeleteConfirmationModal from "@/components/modal/DeleteConfirmationModal";
import { useDeleteAssessment } from "@/hooks/useAssessments";
import { useRouter } from "next/navigation";

export type AssessmentRow = AssessmentShared & {
  courseId: string;  // Added courseId for multi-course context
  urgency?: number;
  courseName?: string;
};

interface AssessmentTableProps {
  assessments: AssessmentRow[];
}

export default function AssessmentTable({ assessments }: AssessmentTableProps) {
  const [editAssessment, setEditAssessment] = useState<AssessmentRow | null>(null);
  const [deleteAssessment, setDeleteAssessment] = useState<AssessmentRow | null>(null);

  const router = useRouter();

  const deleteMutation = useDeleteAssessment();

  if (assessments.length === 0) {
    return <div className="text-muted-foreground">No assessments yet</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr className="text-left">
            {assessments[0]?.courseName !== undefined && <th className="p-3">Course</th>}
            {assessments[0]?.urgency !== undefined && <th className="p-3">Urgency</th>}
            <th className="p-3">Title</th>
            <th className="p-3">Weight</th>
            <th className="p-3">Score</th>
            <th className="p-3">Due Date</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {assessments.map(row => {
            return (
              <tr key={row.assessmentId} 
                  onClick={() => router.push(`/assessments/${row.assessmentId}`)}
                  className="border-t hover:bg-muted/40 cursor-pointer transition-colors">
                {row.courseName !== undefined && (<td className="p-3 font-medium">{row.courseName}</td>)}
                {row.urgency !== undefined && (<td className="p-3">
                  <UrgencyHeatBar urgency={row.urgency} weight={row.weight} />
                </td>)}
                <td className="p-3 font-medium">{row.title}</td>
                <td className="p-3">{(row.weight * 100).toFixed(0)}%</td>
                <td className="p-3">{(row.score !== null && row.maxScore) ? `${row.score}/${row.maxScore}` : "—"}</td>
                <td className="p-3">{new Date(row.dueDate).toLocaleDateString()}</td>
                <td className={`p-3 ${getStatusColor(row.status)}`}>{AssessmentStatusMetadata[row.status].label}</td>
                <td className="p-3 text-center space-x-2">
                  <button
                    className="text-blue-600 hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditAssessment(row);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteAssessment(row);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editAssessment && (
        <EditAssessmentForm
          assessment={editAssessment}
          courseId={editAssessment.courseId}
          open={!!editAssessment}
          onClose={() => setEditAssessment(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteAssessment && (
        <DeleteConfirmationModal
          open={!!deleteAssessment}
          itemName={deleteAssessment.title}
          onClose={() => setDeleteAssessment(null)}
          onConfirm={() => {
            deleteMutation.mutate({ 
              id: deleteAssessment.assessmentId,
              courseId: deleteAssessment.courseId,
             });
            setDeleteAssessment(null);
          }}
        />
      )}
    </div>
  );
}
