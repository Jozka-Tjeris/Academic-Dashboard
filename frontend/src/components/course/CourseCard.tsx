"use client";

import { useRouter } from "next/navigation";
import { CourseShared } from "@internal_package/shared";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import GradeProgress from "../grade/GradeProgress";
import CourseActions from "./CourseActions";

export default function CourseCard({ course }: { course: CourseShared }) {
  const router = useRouter();
  const { currentGrade, gradeMessage } = course.gradeSummary;

  const gradeText =
    currentGrade !== null
      ? `${(currentGrade * 100).toFixed(2)} / ${100}`
      : gradeMessage || "N/A";

  // Navigation handler for the whole card
  const handleCardClick = () => {
    router.push(`/courses/${course.courseId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="block cursor-pointer"
    >
      <Card
        className="hover:shadow-lg transition relative"
        topStripeColor={course.color}
      >
        <div
          className="absolute right-2 top-[22px] z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <CourseActions course={course} />
        </div>

        <CardHeader>
          <CardTitle className="group-hover:text-blue-600 transition-colors">
            {course.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <GradeProgress value={currentGrade} max={1} />
          <p className="text-sm text-muted-foreground">
            {gradeText}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
