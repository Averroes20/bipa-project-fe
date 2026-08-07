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
		<div className="w-64 bg-white border-r border-slate-200 h-screen p-6 flex flex-col fixed z-20">
			<div className="mb-10 px-2">
				<h1 className="text-2xl font-bold text-slate-900">
					BIPA AI
				</h1>
				<p className="text-slate-500 text-sm mt-1">
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
								transition-all duration-200 ease-out
								relative overflow-hidden group
								${
									active
										? "bg-blue-50 text-blue-600 font-semibold"
										: "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
								}
							`}
						>
							<Icon 
                                size={20} 
                                className={`transition-transform duration-200 ${active ? 'scale-105' : 'group-hover:scale-105'}`} 
                            />
							<span className="tracking-wide text-sm">{menu.name}</span>
						</RouterLink>
					)
				})}
			</div>
		</div>
	);
}