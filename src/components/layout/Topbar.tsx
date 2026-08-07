import { Bell, LogOut, Search, PlusCircle, Gift } from "lucide-react";
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
				<div className="flex-1 flex items-center">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-slate-50 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200 transition-shadow"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
                            ⌘F
                        </div>
                    </div>
				</div>

				<div className="flex items-center gap-5">
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Gift size={20} />
                    </button>
                    <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                        <Bell size={20} />
                        <span className="absolute 0 top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                    </button>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <PlusCircle size={20} />
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-1"></div>

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-slate-900 leading-tight">Admin User</span>
                            <span className="text-xs text-slate-500 leading-tight">Business</span>
                        </div>
                        <div className="
                            w-9 h-9 rounded-full
                            bg-slate-100 border border-slate-200
                            flex items-center justify-center
                            font-semibold text-slate-600 shadow-sm
                        ">
                            <img src={`https://ui-avatars.com/api/?name=Admin+User&background=f1f5f9&color=475569`} alt="Avatar" className="w-full h-full rounded-full" />
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        title="Logout"
                        className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                    >
                        <LogOut size={18} />
                    </button>
				</div>
			</div>
	);
}