"use client";

import { Collision } from "@internal_package/shared";

interface CollisionAlertsProps {
  clusters: Collision[];
}

export default function CollisionAlerts({ clusters }: CollisionAlertsProps) {
  if (!clusters || clusters.length === 0) return null;

  const hasSevereCollision = clusters.some((c) => c.count >= 3);

  return (
    <div
      className={`p-6 border rounded-lg space-y-4 ${
        hasSevereCollision
          ? "border-red-300 bg-red-50" 
          : clusters.length > 0 
            ? "border-yellow-300 bg-yellow-50" 
            : "border-gray-300 bg-gray-50"
      }`}
    >
      <h3 className="font-semibold text-red-600">&#x26A0; Deadline Collisions</h3>

      {clusters.map((cluster, i) => (
        <div key={i} className="p-4 border rounded bg-white">
          <p className="font-medium">
            {cluster.count} assessments due between{" "}
            {new Date(cluster.startDate).toLocaleDateString()}
            {" - "}
            {new Date(cluster.endDate).toLocaleDateString()}
          </p>

          <ul className="mt-2 text-sm text-muted-foreground list-disc ml-5 space-y-1">
            {cluster.assessmentIdAndLabels.map((a, idx) => (
              <li key={idx}>
                <span className="font-medium">{a.courseName}</span>
                {" - "}
                {a.title}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
