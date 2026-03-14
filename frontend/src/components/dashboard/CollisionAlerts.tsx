"use client";

import { useCollisions } from "@/hooks/useCollisions";

export default function CollisionAlerts() {
  const { data, isLoading } = useCollisions();

  if (isLoading) return null;

  const clusters = data?.clusters ?? [];

  if (clusters.length === 0) return null;

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="font-semibold mb-4 text-red-500">
        Deadline Collisions
      </h3>

      <ul className="space-y-2">
        {clusters.map((c, i) => (
          <li key={i}>
            {c.count} assessments between{" "}
            {new Date(c.startDate).toLocaleDateString()} -{" "}
            {new Date(c.endDate).toLocaleDateString()}
            <br/>
            [
              {c.assessmentIdAndLabels.map((a, i) => {
              return a.courseName + ": " + a.title + (i < c.assessmentIdAndLabels.length - 1 ? 
                 ", " : "");
              })}
            ]
          </li>
        ))}
      </ul>
    </div>
  );
}
