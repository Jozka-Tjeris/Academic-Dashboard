
interface GradeProgressProps {
  value: number | null;
  max: number | null;
}

const GRADE_BANDS = [
  { min: 0,  max: 50, color: "bg-red-500", band: "#ef4444" },    // Fail
  { min: 50, max: 65, color: "bg-orange-400", band: "#fb923c" }, // Pass
  { min: 65, max: 75, color: "bg-yellow-400", band: "#facc15" }, // Credit
  { min: 75, max: 85, color: "bg-teal-500", band: "#14b8a6" },   // Distinction
  { min: 85, max: 100, color: "bg-green-500", band: "#22c55e" }, // HD
];

export default function GradeProgress({ value, max }: GradeProgressProps) {
  const percentage =
    value != null && max != null && max !== 0
      ? Math.min(100, Math.max(0, (value / max) * 100))
      : 0;

  const gradient = `linear-gradient(to right, ${GRADE_BANDS
    .map(b => `${b.band} ${b.min}%, ${b.band} ${b.max}%`)
    .join(", ")})`;

  return (
    <div className="w-full">
      <div className="relative w-full h-3 rounded-full overflow-hidden">

        {/* Background grade bands */}
        <div
          className="absolute inset-0"
          style={{ background: gradient }}
        />

        {/* Progress bar */}
        {percentage != null && (
          <div
            className={`absolute left-0 top-0 h-full bg-white opacity-70`}
            style={{ width: `${100 - percentage}%`, left: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
}
