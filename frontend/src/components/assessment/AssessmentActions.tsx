"use client";

import { useState } from "react";
import { AssessmentShared, AssessmentStatuses } from "@internal_package/shared";
import { useDeleteAssessment } from "@/hooks/useAssessments";

import EditAssessmentForm from "@/components/modal/EditAssessmentForm";
import DeleteConfirmationModal from "@/components/modal/DeleteConfirmationModal";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { MoreVertical } from "lucide-react";
import SubmitAssessmentForm from "../modal/SubmitAssessmentForm";

interface Props {
  assessment: AssessmentShared & { courseId: string };
  variant?: "dropdown" | "inline";
  onDeleted?: () => void;
}

export default function AssessmentActions({
  assessment,
  variant = "dropdown",
  onDeleted,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const deleteMutation = useDeleteAssessment();

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: assessment.assessmentId,
        courseId: assessment.courseId,
      },
      {
        onSuccess: () => {
          setDeleteOpen(false);
          onDeleted?.();
        },
      }
    );
  };

  const actions = (
    <>
      <button
        className="text-blue-600 hover:underline cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setSubmitOpen(true);
        }}
      >
        Submit
      </button>
      <button
        className="hover:underline cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setEditOpen(true);
        }}
      >
        Edit
      </button>

      <button
        className="text-red-600 hover:underline cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setDeleteOpen(true);
        }}
      >
        Delete
      </button>
    </>
  );

  return (
    <>
      {variant === "inline" ? (
        <div className="flex gap-3 cursor-pointer">{actions}</div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-muted cursor-pointer">
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              setSubmitOpen(true);
            }}
              className="text-blue-600 cursor-pointer">
              {(assessment.status !== AssessmentStatuses.SUBMITTED &&
                assessment.status !== AssessmentStatuses.GRADED) 
                ? "Submit" 
                : assessment.status === AssessmentStatuses.SUBMITTED 
                  ? "Submit With Score"
                  : "Check Score"
              }
            </DropdownMenuItem>

            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              setEditOpen(true);
            }}
              className="cursor-pointer">
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteOpen(true);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <SubmitAssessmentForm
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        assessmentId={assessment.assessmentId}
        status={assessment.status}
        courseId={assessment.courseId}
        currentScore={assessment.score}
        maxScore={assessment.maxScore}
      />

      <EditAssessmentForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        courseId={assessment.courseId}
        assessment={assessment}
      />

      <DeleteConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        itemName={assessment.title}
        onConfirm={handleDelete}
      />
    </>
  );
}
