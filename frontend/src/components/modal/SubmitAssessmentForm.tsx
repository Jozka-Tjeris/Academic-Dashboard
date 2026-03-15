"use client";

import { useState } from "react";
import  Modal from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useSubmitAssessment } from "@/hooks/useSubmitAssessment";
import { AssessmentStatus, AssessmentStatuses } from "@internal_package/shared";

interface SubmitAssessmentFormProps {
  assessmentId: string;
  status: AssessmentStatus;
  currentScore: number | null;
  maxScore: number;
  courseId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SubmitAssessmentForm({
  assessmentId,
  status,
  currentScore,
  maxScore,
  courseId,
  open,
  onClose,
  onSuccess,
}: SubmitAssessmentFormProps) {
  const [score, setScore] = useState<number | null>(currentScore);
  const { submit, isLoading } = useSubmitAssessment(courseId);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if(score && score > maxScore){
      setErrMsg("Score cannot exceed max score: " + maxScore);
      return;
    }
    else{
      console.log("E")
      await submit(assessmentId, score);
      onSuccess?.();
      onClose();
    }
  };

  const isDisabled = currentScore !== null; // if already graded, disable editing
  const isSubmitted = status === AssessmentStatuses.SUBMITTED;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4">
        <p>
          You can submit the assessment without a score or provide a score. If you have submitted a score, it can't be changed again!
        </p>

        <Input
          type="number"
          placeholder={`${isSubmitted ? "Score" : "Score (optional)"}`}
          value={String(score) ?? ""}
          onChange={(e) =>
            setScore(Number.isFinite(+e.target.value) ? parseFloat(e.target.value) : null)
          }
          disabled={isDisabled}
        />

        {errMsg && <p className="text-red-500">{errMsg}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" className="cursor-pointer" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={
              isSubmitted ? 
              (isLoading || score === null) :
              (isLoading || isDisabled)
            }
            className="cursor-pointer"
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}