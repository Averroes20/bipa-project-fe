import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar(){
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

	return (
			<div className="
				h-20
				border-b border-slate-200
				bg-white
                sticky top-0 z-10
				px-8
				flex items-center justify-between
			">
				<div>
					<h2 className="text-xl font-semibold text-slate-900">
						Dashboard
					</h2>
					<p className="text-slate-500 text-sm mt-0.5">
						Monitor BIPA Pronunciation Analytics
					</p>
				</div>

				<div className="flex items-center gap-6">
                    <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                        <Bell size={20} />
                        <span className="absolute 0 top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
                    </button>
                    <button 
                        onClick={handleLogout}
                        title="Logout"
                        className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
					<div className="
						w-10 h-10 rounded-full
						bg-blue-600
						flex items-center justify-center
						font-semibold text-white shadow-sm
                        cursor-pointer hover:bg-blue-700 transition-colors
					">
						A
					</div>
				</div>
			</div>
	);
}