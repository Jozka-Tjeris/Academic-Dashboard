
interface GradeProgressProps {
  value: number | null;
  max: number | null;
}

export default function GradeProgress({ value, max }: GradeProgressProps) {
  const percentage = (value && max ? (max === 0 ? 0 : (value / max * 100)) : NaN);

  const getColor = () => {
    if (percentage >= 85) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    if (percentage >= 0) return "bg-red-500";
    return "bg-gray-500";
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
