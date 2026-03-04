import { Prisma } from "@prisma/client";

interface GradeProgressProps {
  value: Prisma.Decimal;
  max: Prisma.Decimal;
}

export default function GradeProgress({ value, max }: GradeProgressProps) {
  const percentage = max.eq(0) ? new Prisma.Decimal(0) : (value.div(max).mul(100));

  const getColor = () => {
    if (percentage.gte(85)) return "bg-green-500";
    if (percentage.gte(70)) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
