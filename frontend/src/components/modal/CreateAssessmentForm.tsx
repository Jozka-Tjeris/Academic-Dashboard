"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAssessmentSchema } from "@/lib/validation/assessmentSchema";
import { useCreateAssessment } from "@/hooks/useAssessments";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useEffect, useState } from "react";
import { z } from "zod";

type FormData = z.infer<typeof createAssessmentSchema>;

export default function AddAssessmentForm({ courseId }: { courseId: string }) {

  const [open, setOpen] = useState(false);

  const {mutate, isPending} = useCreateAssessment(courseId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createAssessmentSchema),
  });

  const onSubmit = (data: FormData) => {
    mutate({
      ...data,
      weight: data.weight / 100,
      dueDate: new Date(data.dueDate),
    }, {
      onError: (err) => {
        alert(err.message);
      }
    });

    setOpen(false);
    reset();
  };

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="cursor-pointer px-2 py-1 bg-black rounded-md text-white">
        Add Assessment
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          <div>
            <label htmlFor="title">Title</label>
            <Input
              placeholder="Title"
              {...register("title")}
            />

            {errors.title && (
              <p className="text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>


          <label htmlFor="date">Due Date</label>
          <Input
            type="date"
            {...register("dueDate")}
          />

          <label htmlFor="weight">Weight</label>
          <Input
            type="number"
            placeholder="Weight"
            {...register("weight", { valueAsNumber: true })}
          />

          <label htmlFor="maxScore">Max Score</label>
          <Input
            type="number"
            placeholder="Max Score"
            {...register("maxScore", { valueAsNumber: true })}
          />

          <Button type="submit"
            disabled={isPending}
            className="w-full cursor-pointer"
          >
            Create Assessment
          </Button>

        </form>

      </Modal>
    </>
  );
}
