import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  description,
  icon,
  trend
}: Props) {
  return (
    <div className="
      bg-white
      border border-slate-100
      shadow-[0_1px_2px_rgba(0,0,0,0.02)]
      rounded-xl
      p-5
      flex flex-col
      relative
    ">
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-slate-500">
                {icon && <div className="text-slate-400">{icon}</div>}
                <span className="text-sm font-medium tracking-wide">{title}</span>
            </div>
            <Info size={16} className="text-slate-300" />
        </div>

        <div className="flex items-baseline gap-3">
            <h2 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none">
                {value}
            </h2>
            {trend && (
                <div className={`
                    text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center
                    ${trend.isPositive ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}
                `}>
                    {trend.value}
                </div>
            )}
        </div>

        {description && (
            <p className="text-slate-400 text-xs mt-2 font-medium">
                {description}
            </p>
        )}
    </div>
  );
}