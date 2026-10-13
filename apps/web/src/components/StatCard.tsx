interface StatCardProps {
  value: number | string;
  label: string;
  hint?: string;
}

export function StatCard({ value, label, hint }: StatCardProps) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
      {hint ? <span className="stat__hint">{hint}</span> : null}
    </div>
  );
}
