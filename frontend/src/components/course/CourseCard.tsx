import { CourseShared } from "@internal_package/shared";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import GradeProgress from "../grade/GradeProgress";
import Link from "next/link";

export default function CourseCard({ course }: { course: CourseShared }) {
  const { currentGrade, maxPossibleGrade, gradeMessage } = course.gradeSummary;

  // Determine the display text for the grade
  const gradeText =
    currentGrade !== null && maxPossibleGrade !== null
      ? `${currentGrade.toFixed(2)} / ${maxPossibleGrade.toFixed(2)}`
      : gradeMessage || "N/A"; // fallback if no message

  return (
    <Link href={`/courses/${course.courseId}`}
      className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
    >
      <Card className="hover:shadow-lg transition">
        <CardHeader>
          <CardTitle>{course.name}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <GradeProgress value={currentGrade} max={maxPossibleGrade} />

          <p className="text-sm text-muted-foreground">
            {gradeText}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
