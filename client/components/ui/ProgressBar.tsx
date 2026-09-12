interface Props {
  value: number;
  color?: string;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  value,
  color = 'bg-blue-600',
  label,
  showPercent = true,
  size = 'md',
}: Props) {
  const heights: Record<string, string> = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          {showPercent && <span className="text-sm font-semibold text-slate-700">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full ${heights[size]}`}>
        <div
          className={`${color} rounded-full ${heights[size]} transition-all duration-700`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
