"use client";

import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useUpdateCourse } from "@/hooks/useCourses";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface EditCourseFormProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  name: string;
  description?: string | null;
}

type FormData = {
  name: string;
  description?: string;
};

export default function EditCourseForm({
  open,
  onClose,
  courseId,
  name,
  description,
}: EditCourseFormProps) {

  const mutation = useUpdateCourse();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name,
      description: description ?? "",
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        id: courseId,
        data,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  useEffect(() => {
    if (open) {
      reset({
        name,
        description: description ?? "",
      });
    }
  }, [open, name, description, reset]);

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Edit Course</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <label>Course Name</label>
          <Input {...register("name")} />
        </div>

        <div>
          <label>Description</label>
          <Input {...register("description")} />
        </div>

        <Button type="submit" className="w-full cursor-pointer">
          Save Changes
        </Button>
      </form>
    </Modal>
  );
}
