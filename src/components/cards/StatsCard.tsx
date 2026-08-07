import type { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  description: string;
  icon?: ReactNode;
}

export default function StatsCard({
  title,
  value,
  description,
  icon
}: Props) {
  return (
    <div className="
      bg-white
      border border-slate-200
      shadow-sm
      rounded-xl
      p-5
      flex flex-col
    ">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 text-sm font-medium">
                {title}
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {value}
                </h2>
            </div>
            
            {icon && (
                <div className="text-slate-400">
                    {icon}
                </div>
            )}
        </div>

        <p className="text-slate-400 text-xs mt-2">
          {description}
        </p>
    </div>
  );
}