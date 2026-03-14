"use client";

import { useState } from "react";
import { CourseShared } from "@internal_package/shared";
import { useDeleteCourse } from "@/hooks/useCourses";
import EditCourseForm from "@/components/modal/EditCourseForm";
import DeleteConfirmationModal from "@/components/modal/DeleteConfirmationModal";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { MoreVertical } from "lucide-react";

interface Props {
  course: CourseShared;
  variant?: "dropdown" | "inline";
  onDeleted?: () => void;
}

export default function CourseActions({
  course,
  variant = "dropdown",
  onDeleted,
}: Props) {

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMutation = useDeleteCourse();

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: course.courseId },
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
            <button className="p-1 rounded hover:bg-muted cursor-pointer"
              onClick={(e) => e.stopPropagation()}>
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
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

      <EditCourseForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        courseId={course.courseId}
        name={course.name}
        description={course.description}
      />

      <DeleteConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        itemName={course.name}
        onConfirm={handleDelete}
      />
    </>
  );
}
