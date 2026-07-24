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
      glass
      rounded-2xl
      p-6
      relative overflow-hidden group
      transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20
    ">
        {/* Subtle gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">
                {title}
                </p>

                <h2 className="text-3xl font-bold text-white mt-2 tracking-tight group-hover:text-blue-400 transition-colors">
                {value}
                </h2>
            </div>
            
            {icon && (
                <div className="p-3 bg-slate-800/50 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner border border-slate-700/50">
                    {icon}
                </div>
            )}
        </div>

        <p className="text-slate-500 text-sm mt-4 relative z-10">
          {description}
        </p>
    </div>
  );
}