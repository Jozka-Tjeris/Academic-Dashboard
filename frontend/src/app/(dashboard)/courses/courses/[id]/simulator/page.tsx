"use client";

import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCourse } from "@/hooks/useCourses";
import SimulatorTable from "@/components/simulator/SimulatorTable";
import { useCourseSimulation } from "@/hooks/useSimulator";
import { useState } from "react";
import { SimulationInput, SimulationResult } from "@/api/simulator";

export default function SimulatorPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useCourse(id);
  const simulate = useCourseSimulation(id);

  const [result, setResult] = useState<SimulationResult | null>(null);

  if (isLoading || !data) return <p>Loading...</p>;

  const runSimulation = (payload: SimulationInput[]) => {
    simulate.mutate(payload, {
      onSuccess: (res) => setResult(res),
    });
  };

  return (
    <DashboardLayout title={`${data.name} Simulator`}>
      <SimulatorTable
        assessments={data.assessments ?? []}
        onRunSimulation={runSimulation}
      />

      {result && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold mb-1">
            Projected Grade
          </h3>

          <p className="text-lg font-bold">
            {result.projectedGrade.toFixed(2)} /{" "}
            {result.maxPossibleGrade.toFixed(2)}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
