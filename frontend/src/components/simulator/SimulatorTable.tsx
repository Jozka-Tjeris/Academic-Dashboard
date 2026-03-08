"use client";

import { useState } from "react";
import { Assessment } from "@internal_package/shared";
import Button from "@/components/ui/Button";
import { SimulationInput } from "@/api/simulator";

interface SimulatorTableProps {
  assessments: Assessment[];
  onRunSimulation: (data: SimulationInput[]) => void;
}

export default function SimulatorTable({
  assessments,
  onRunSimulation,
}: SimulatorTableProps) {
  const [rows, setRows] = useState(
    assessments.map((a) => ({
      id: a.assessmentId,
      simulatedScore: a.score ?? "",
      targetScore: a.targetScore ?? "",
    }))
  );

  const updateRow = (
    index: number,
    field: "simulatedScore" | "targetScore",
    value: string
  ) => {
    const copy = [...rows];
    copy[index][field] = value;
    setRows(copy);
  };

  const runSimulation = () => {
    const payload = rows
      .filter(r => r.simulatedScore !== "")
      .map((r) => ({
        assessmentId: r.id,
        simulatedScore: Number(r.simulatedScore),
        targetScore:
          r.targetScore === ""
            ? undefined
            : Number(r.targetScore),
    }));

    onRunSimulation(payload);
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-3 text-left">Assessment</th>
            <th className="p-3 text-left">Current Score</th>
            <th className="p-3 text-left">Hypothetical</th>
            <th className="p-3 text-left">Target</th>
          </tr>
        </thead>

        <tbody>
          {assessments.map((a, i) => (
            <tr key={a.assessmentId} className="border-b">
              <td className="p-3">{a.title}</td>

              <td className="p-3">
                {a.score ?? "-"} / {a.maxScore ?? "-"}
              </td>

              <td className="p-3">
                <input
                  type="number"
                  value={rows[i].simulatedScore}
                  onChange={(e) =>
                    updateRow(
                      i,
                      "simulatedScore",
                      e.target.value
                    )
                  }
                  className="border rounded px-2 py-1 w-24"
                />
              </td>

              <td className="p-3">
                <input
                  type="number"
                  value={rows[i].targetScore}
                  onChange={(e) =>
                    updateRow(
                      i,
                      "targetScore",
                      e.target.value
                    )
                  }
                  className="border rounded px-2 py-1 w-24"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-4">
        <Button onClick={runSimulation}>
          Run Simulation
        </Button>
      </div>
    </div>
  );
}
