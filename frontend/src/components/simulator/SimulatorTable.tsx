"use client";

import { useEffect, useState } from "react";
import { AssessmentShared, PENALTY_PERCENT_PER_DAY, TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { Button } from "@/components/ui/Button";
import { useCourseSimulation } from "@/hooks/useSimulator";

interface SimulatorTableProps {
  courseId: string;
  assessments: AssessmentShared[];
  currentGrade: number | null;
}

type SimulatorRow = AssessmentShared & {
    simulatedScore?: number;
    targetScore: number | null;
};

export default function SimulatorTable({
  courseId,
  assessments,
  currentGrade,
}: SimulatorTableProps) {
  const { mutate, data, isPending } = useCourseSimulation(courseId);
  const [targets, setTargets] = useState<SimulatorRow[]>([]);

  useEffect(() => {

    const initial = assessments.map(a => ({
      ...a,
    }))

    setTargets(initial);
  }, [assessments]);

  const updateTarget = (assessmentId: string, field: "simulatedScore" | "targetScore", value: string) => {
    field === "simulatedScore" ? 
    setTargets(prev => 
      (prev.map(
        p => ({
          ...p,
          simulatedScore: p.assessmentId === assessmentId ? 
            (value !== "" ? Number(value) : undefined)
            : p.simulatedScore
         })
      )) 
    )
    : 
    setTargets(prev => 
      (prev.map(
        p => ({
          ...p,
          targetScore: p.assessmentId === assessmentId ? 
            (value !== "" ? Number(value) : null)
            : p.targetScore
         })
      ))
    )
  };

  const runSimulation = () => {
    mutate(
      targets.filter(t => t.simulatedScore !== undefined).map(t => ({
        assessmentId: t.assessmentId,
        simulatedScore: t.simulatedScore ?? 0,
        targetScore: t.targetScore,
      }))
    )
  };

  const calculateTotalPenalty = (submission: Date | null, due: Date): number => {
    if(submission !== null){
      const subDay = new Date(submission);
      subDay.setUTCHours(0, 0, 0, 0);
      const dueDay = new Date(due);
      dueDay.setUTCHours(0, 0, 0, 0);
      return Math.max(0, new Date(subDay).getTime() - new Date(dueDay).getTime()) / TWENTYFOUR_HOURS_IN_MS * PENALTY_PERCENT_PER_DAY;
    }
    let today = new Date();
    let todayAtMidnight = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    return Math.max(0, todayAtMidnight.getTime() - new Date(due).getTime()) / TWENTYFOUR_HOURS_IN_MS * PENALTY_PERCENT_PER_DAY;
  }

  return (
    <div className="flex flex-col h-[90%] gap-4">
      <div className="h-[85%]">
        <div className="bg-white border rounded-xl overflow-y-auto max-h-[85%]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b sticky top-0">
              <tr>
                <th className="p-3 text-left">Assessment</th>
                <th className="p-3 text-left">Weight</th>
                <th className="p-3 text-left">Current Score</th>
                <th className="p-3 text-left">Late Penalty</th>
                <th className="p-3 text-left">Simulated</th>
                {/* <th className="p-3 text-left">Target</th> */}
              </tr>
            </thead>

            <tbody>
              {targets.map((t, i) => (
                <tr key={t.assessmentId} 
                  className={`${i < targets.length - 1 && 'border-b'}`}
                >
                  <td className="p-3">{t.title}</td>

                  <td className="p-3">
                    {t.weight * 100}%
                  </td>

                  <td className="p-3">
                    {t.score ?? "-"} / {t.maxScore ?? "-"}
                  </td>

                  <td className="p-3">
                    {calculateTotalPenalty(t.submissionDate, t.dueDate) * 100}%
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      name="allowsEmpty"
                      value={t.simulatedScore ?? ""}
                      onChange={(e) =>
                        updateTarget(
                          t.assessmentId,
                          "simulatedScore",
                          e.target.value
                        )
                      }
                      className="border rounded px-2 py-1 w-24"
                    />
                  </td>

                  {/* <td className="p-3">
                    <input
                      type="number"
                      value={t.targetScore ?? "N/A"}
                      onChange={(e) =>
                        updateTarget(
                          t.assessmentId,
                          "targetScore",
                          e.target.value
                        )
                      }
                      className="border rounded px-2 py-1 w-24"
                    />
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    <div className="flex flex-col bg-white border rounded-xl bottom-4 w-[50%] shadow-sm">
      <div className="flex flex-row justify-between p-4 rounded-b">
        <div>
          <p className="text-sm text-muted-foreground">
          Current Grade
          </p>

          <p className="text-xl font-semibold">
            {data ? (data.currentGrade * 100).toFixed(2) : "--"}%
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Projected Final Grade
          </p>

          <p className="text-xl font-semibold">
            {data ? (data.simulatedFinalGrade * 100).toFixed(2) : "--"}%
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Max Possible Grade
          </p>

          <p className="text-xl font-semibold">
            {data ? (data.maxPossibleGrade * 100).toFixed(2) : "--"}%
          </p>
        </div>
      </div>

      <div className="p-4">
        <Button onClick={runSimulation} disabled={isPending}
          className="cursor-pointer">
          Run Simulation
        </Button>
      </div>
    </div>
    </div>
  );
}
