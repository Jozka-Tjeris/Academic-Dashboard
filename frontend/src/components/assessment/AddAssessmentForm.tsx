"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateAssessment } from "@/hooks/useAssessments";

interface AddAssessmentFormProps {
  courseId: string;
}

export default function AddAssessmentForm({ courseId }: AddAssessmentFormProps) {
  const { mutate, isPending } = useCreateAssessment(courseId);

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [weight, setWeight] = useState("");
  const [maxScore, setMaxScore] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setError(null);

    mutate(
      {
        title,
        dueDate: new Date(dueDate),
        weight: Number(weight) / 100,
        maxScore: Number(maxScore),
        description: "Nothing here",
      },
      {
        onSuccess: () => {
          setTitle("");
          setDueDate("");
          setWeight("");
          setMaxScore("");
        },
        onError: (err: Error) => {
          setError(err.message);
        },
      }
    );
  };

  return (
    <div className="bg-white border rounded-xl p-4 mb-6">
      <h3 className="font-semibold mb-3">Add Assessment</h3>

      <div className="grid grid-cols-4 gap-3">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Input
          label="Weight (%)"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <Input
          label="Max Score"
          type="number"
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">
          {error}
        </p>
      )}

      <div className="mt-3">
        <Button onClick={handleSubmit} variant={isPending ? "ghost" : "default"}>
          Add Assessment
        </Button>
      </div>
    </div>
  );
}
