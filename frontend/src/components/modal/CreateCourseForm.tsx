"use client";

import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateCourse } from "@/hooks/useCourses";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createCourseSchema,
  CreateCourseInput,
} from "@/lib/validation/courseSchema";
import { useEffect } from "react";

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CourseFormModal({
  open,
  onClose,
}: CourseFormModalProps) {
  const { mutate, isPending } = useCreateCourse();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6",
    },
  });

  const onSubmit = (data: CreateCourseInput) => {
    mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.global,
        });

        reset();
        onClose();
      },
      onError: (err) => {
        alert(err.message);
      }
    });
  };

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Create Course</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Name */}
        <div>
          <label htmlFor="name">Course Name</label>
          <Input id="name" {...register("name")} />

          {errors.name && (
            <p className="text-sm text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description">Description</label>
          <Input id="description" {...register("description")} />
        </div>

        {/* Color */}
        <div>
          <label htmlFor="color">Course Color</label>
          <Input type="color" id="color" {...register("color")} />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full cursor-pointer"
        >
          {isPending ? "Creating..." : "Create Course"}
        </Button>
      </form>
    </Modal>
  );
}
