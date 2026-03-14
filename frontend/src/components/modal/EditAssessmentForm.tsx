"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAssessmentSchema } from "@/lib/validation/assessmentSchema";
import { useUpdateAssessment } from "@/hooks/useAssessments";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useEffect } from "react";
import { z } from "zod";
import { AssessmentShared } from "@internal_package/shared";

type FormData = z.infer<typeof createAssessmentSchema>;

interface EditAssessmentFormProps {
  assessment: AssessmentShared;
  courseId: string;
  open: boolean;
  onClose: () => void;
}

export default function EditAssessmentForm({
  assessment,
  courseId,
  open,
  onClose,
}: EditAssessmentFormProps) {
  const mutation = useUpdateAssessment(courseId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createAssessmentSchema),
    defaultValues: {
      ...assessment,
      dueDate: new Date(assessment.dueDate).toISOString().split("T")[0],
      weight: assessment.weight ?? 0,
      maxScore: assessment.maxScore ?? 0,
      description: assessment.description ?? undefined,
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        id: assessment.assessmentId,
        data: {
          ...data,
          dueDate: new Date(data.dueDate),
        },
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  useEffect(() => {
    if (!open) reset();
  }, [open, reset, assessment]);

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Edit Assessment</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title">Title</label>
          <Input {...register("title")} />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate">Due Date</label>
          <Input type="date" {...register("dueDate")} />
        </div>

        {/* Weight */}
        <div>
          <label htmlFor="weight">Weight</label>
          <Input
            type="number"
            step="0.01"
            {...register("weight", { valueAsNumber: true })}
          />
        </div>

        {/* Max Score */}
        <div>
          <label htmlFor="maxScore">Max Score</label>
          <Input
            type="number"
            {...register("maxScore", { valueAsNumber: true })}
          />
        </div>

        {/* Optional description */}
        <div>
          <label htmlFor="description">Description</label>
          <Input {...register("description")} />
        </div>

        {/* Optional maxScore */}
        <div>
          <label htmlFor="maxScore">Max Score</label>
          <Input
            type="number"
            {...register("maxScore", { valueAsNumber: true })}
          />
        </div>

        <Button type="submit" className="w-full cursor-pointer">
          Save Changes
        </Button>
      </form>
    </Modal>
  );
}
