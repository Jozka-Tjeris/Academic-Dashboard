"use client";

import { useState } from "react";
import { AssessmentShared } from "@internal_package/shared";
import { useUpdateAssessment } from "@/hooks/useAssessments";

interface EditableScoreProps {
  assessment: AssessmentShared;
  courseId: string;
}

export default function EditableScore({ assessment, courseId }: EditableScoreProps) {
  const { mutate } = useUpdateAssessment(courseId);

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(
    assessment.score !== null ? String(assessment.score) : ""
  );

  const submit = () => {
    setEditing(false);

    mutate({
      id: assessment.assessmentId,
      data: {
        score: value === "" ? undefined : Number(value),
        submissionDate: assessment.submissionDate ?? undefined,
        targetScore: assessment.targetScore ?? undefined,
      },
    });
  };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="cursor-pointer hover:underline"
      >
        {assessment.score ?? "-"}
      </span>
    );
  }

  return (
    <input
      autoFocus
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={submit}
      onKeyDown={(e) => {
        if (e.key === "Enter") submit();
      }}
      className="border px-2 py-1 rounded w-20"
    />
  );
}
