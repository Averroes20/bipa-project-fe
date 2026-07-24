import { BarChart3, Database, LayoutDashboard, Users, ActivitySquare } from "lucide-react";
import { useLocation, Link as RouterLink } from "react-router-dom";

const menus = [
	{
		name: "Dashboard",
		path: "/",
		icon: LayoutDashboard
	},
    {
        name: "Analyze",
        path: "/analyze",
        icon: ActivitySquare
    },
	{
		name: "Analytics",
		path: "/analytics",
		icon: BarChart3
	},
	{
		name: "Dataset",
		path: "/dataset",
		icon: Database
	},
	{
		name: "Users",
		path: "/users",
		icon: Users
	}
];

export default function Sidebar() {
	const location = useLocation();

	return (
		<div className="w-64 glass border-r border-slate-800/50 h-screen p-6 flex flex-col fixed z-20">
			<div className="mb-10 px-2">
				<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
					BIPA AI
				</h1>
				<p className="text-slate-400 text-sm mt-1">
					Speech Analytics CMS
				</p>
			</div>

			<div className="flex flex-col gap-2">
				{menus.map((menu) => {
					const Icon = menu.icon;
					const active = location.pathname === menu.path;
					
					return (
						<RouterLink 
							key={menu.name}
							to={menu.path}
							className={`
								flex items-center gap-3
								px-4 py-3 rounded-xl
								transition-all duration-300 ease-out
								relative overflow-hidden group
								${
									active
										? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]"
										: "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
								}
							`}
						>
							<Icon 
                                size={20} 
                                className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} 
                            />
							<span className="font-medium tracking-wide text-sm">{menu.name}</span>
						</RouterLink>
					)
				})}
			</div>
		</div>
	);
}