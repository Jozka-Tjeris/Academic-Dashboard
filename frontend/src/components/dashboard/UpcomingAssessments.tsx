import { AssessmentShared, AssessmentStatuses } from "@internal_package/shared";
import AssessmentActions from "../assessment/AssessmentActions";
import { useRouter } from "next/navigation";

export default function UpcomingAssessments({
  assessments,
}: {
  assessments: AssessmentShared[];
}) {
  const router = useRouter();

  const upcoming = assessments
    .filter((a) => a.status === AssessmentStatuses.UPCOMING || a.status === AssessmentStatuses.DUE_IN_24_HOURS)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>

      <ul className="space-y-2">
        {upcoming.map((a) => (
          <li key={a.assessmentId} 
            className="p-2 rounded hover:bg-muted/60 cursor-pointer flex justify-between items-center"
            onClick={() => router.push(`/assessments/${a.assessmentId}`)}
          >
            <span>{a.title}</span>
            <span className="text-muted-foreground text-sm">
              {new Date(a.dueDate).toLocaleDateString()}
            </span>
            <AssessmentActions assessment={a}/>
          </li>
        ))}
      </ul>
    </div>
  );
}
