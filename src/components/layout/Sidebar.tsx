import { BarChart3, Database, LayoutDashboard, Users, ActivitySquare } from "lucide-react";
import { useLocation, Link as RouterLink } from "react-router-dom";

const groups = [
	{
		title: "GENERAL",
		menus: [
			{ name: "Dashboard", path: "/", icon: LayoutDashboard },
			{ name: "Users", path: "/users", icon: Users },
		]
	},
	{
		title: "TOOLS",
		menus: [
			{ name: "Analyze", path: "/analyze", icon: ActivitySquare },
			{ name: "Analytics", path: "/analytics", icon: BarChart3, badge: "BETA" },
			{ name: "Dataset", path: "/dataset", icon: Database },
		]
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

			<div className="flex flex-col gap-6 flex-1">
				{groups.map((group) => (
					<div key={group.title}>
						<h3 className="text-xs font-semibold text-slate-400 mb-3 px-2 tracking-wider">
							{group.title}
						</h3>
						<div className="flex flex-col gap-1">
							{group.menus.map((menu) => {
								const Icon = menu.icon;
								const active = location.pathname === menu.path;
								
								return (
									<RouterLink 
										key={menu.name}
										to={menu.path}
										className={`
											flex items-center justify-between
											px-4 py-2.5 rounded-lg
											transition-all duration-200 ease-out
											relative overflow-hidden group
											${
												active
													? "bg-indigo-50 text-indigo-600 font-medium"
													: "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
											}
										`}
									>
										<div className="flex items-center gap-3">
											<Icon 
												size={18} 
												className={`transition-transform duration-200 ${active ? 'scale-105' : 'group-hover:scale-105'}`} 
											/>
											<span className="tracking-wide text-sm">{menu.name}</span>
										</div>
										{menu.badge && (
											<span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">
												{menu.badge}
											</span>
										)}
									</RouterLink>
								)
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}