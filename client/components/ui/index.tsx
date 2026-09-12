import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium px-2 py-0.5 rounded-full">
      🧪 Demo Mode
    </span>
  );
}

export function StatCard({ label, value, color = 'text-blue-600', sub }: {
  label: string; value: string | number; color?: string; sub?: string;
}) {
  return (
    <div className="card">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}
