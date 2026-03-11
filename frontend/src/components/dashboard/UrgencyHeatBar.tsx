type Props = {
  urgency: number;
  weight: number;
};

function getColor(urgency: number, weight: number) {
  if (urgency === 0) return "bg-green-500";
  if (urgency < weight) return "bg-yellow-400";
  if (urgency < 1) return "bg-orange-500";
  return "bg-red-600";
}

function normalizeUrgency(urgency: number) {
  // compress scale so >1 doesn't blow out the UI
  const capped = Math.min(urgency, 2);
  return capped / 2;
}

export default function UrgencyHeatBar({ urgency, weight }: Props) {
  const width = normalizeUrgency(urgency) * 100;
  const color = getColor(urgency, weight);

  return (
    <div className="w-24 h-2 bg-muted rounded overflow-hidden">
      <div
        className={`h-full ${color} transition-all`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
