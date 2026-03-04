import { Course } from "@internal_package/shared";
import GradeProgress from "../grade/GradeProgress";
import Link from "next/link";

export default function CourseCard({ course }: { course: Course }) {
  const { currentGrade, maxPossibleGrade } = course.gradeSummary;

  return (
    <Link
      href={`/courses/${course.courseId}`}
      className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
    >
      <h3 className="text-lg font-semibold mb-2">{course.name}</h3>

      <p className="text-sm text-gray-600 mb-3">
        {currentGrade.toFixed(2)} / {maxPossibleGrade.toFixed(2)}
      </p>

      <GradeProgress value={currentGrade} max={maxPossibleGrade} />
    </Link>
  );
}
