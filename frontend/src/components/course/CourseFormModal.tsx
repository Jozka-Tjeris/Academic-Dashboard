"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateCourse } from "@/hooks/useCourses";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CourseFormModal({ open, onClose }: CourseFormModalProps) {
  const { mutate, isPending } = useCreateCourse();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Course name is required");
      return;
    }

    setError(null);

    mutate(
      { name, description },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.global })
          setName("");
          setDescription("");
          onClose();
        },
        onError: (err: Error) => {
          setError(err.message);
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Create Course</h2>

      <div className="space-y-4">
        <Input
          label="Course Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error || undefined}
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Button
          onClick={handleSubmit}
          variant={isPending ? "ghost" : "default"}
          className="w-full"
        >
          Create Course
        </Button>
      </div>
    </Modal>
  );
}
