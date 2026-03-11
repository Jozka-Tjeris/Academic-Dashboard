"use client";

import { CourseShared } from "@internal_package/shared";
import UrgencyHeatBar from "./UrgencyHeatBar";
import { AssessmentWithUrgency } from "@/types/dashboard";

export default function UrgentAssessments({
  courses,
}: {
  courses: CourseShared[];
}) {
  const urgent = courses
    .flatMap((c) =>
      (c.assessments ?? []).map((a) => ({
        ...a,
        courseName: c.name,
      }))
    )
    .filter((a: any) => !a.submitted)
    .sort((a: any, b: any) => (b.urgency ?? 0) - (a.urgency ?? 0))
    .slice(0, 6);

  if (urgent.length === 0) {
    return (
      <div className="p-6 border rounded-lg">
        <h3 className="font-semibold mb-4">Urgent Tasks</h3>
        <p className="text-sm text-muted-foreground">
          No urgent assessments 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="font-semibold mb-4">
        Urgent Assessments
      </h3>

      <ul className="space-y-3">
        {urgent.map((a) => (
          <li
            key={a.assessmentId}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex flex-col">
              <span className="font-medium">{a.title}</span>

              <span className="text-xs text-muted-foreground">
                Due {new Date(a.dueDate).toLocaleDateString()}
              </span>
            </div>

            <UrgencyHeatBar
              urgency={(a as any).urgency ?? 0}
              weight={a.weight ?? 0}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
