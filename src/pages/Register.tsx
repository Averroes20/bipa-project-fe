import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      setLoading(true);

      await register({
        email,
        password,
      });

      setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke login...");
      setTimeout(() => {
          navigate("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "Pendaftaran gagal. Email mungkin sudah terdaftar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="
      min-h-screen
      bg-slate-50
      flex items-center justify-center
      relative overflow-hidden font-sans
    ">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-100 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10 px-6">
          <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white border border-slate-100 rounded-2xl mb-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <Sparkles className="text-purple-600" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                Create Account
              </h1>
              <p className="text-slate-500 text-sm">Join BIPA Audio Analytics CMS</p>
          </div>

          <form
            onSubmit={handleRegister}
            className="
              bg-white
              rounded-3xl
              p-8
              shadow-xl shadow-slate-200/50
              border border-slate-200"
          >
            {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                    {errorMsg}
                </div>
            )}
            
            {successMsg && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center">
                    {successMsg}
                </div>
            )}

            <div className="space-y-5">
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                      <Mail size={20} />
                  </div>
                  <input 
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="
                      w-full
                      bg-slate-50
                      border border-slate-200
                      rounded-xl
                      pl-12 pr-4 py-3.5
                      text-slate-900 placeholder:text-slate-400
                      focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:bg-white
                      transition-all duration-300"
                  />
              </div>

              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-600 transition-colors">
                      <Lock size={20} />
                  </div>
                  <input 
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="
                    w-full
                    bg-slate-50
                    border border-slate-200
                    rounded-xl
                    pl-12 pr-4 py-3.5
                    text-slate-900 placeholder:text-slate-400
                    focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:bg-white
                    transition-all duration-300
                  "
                  />
              </div>

              <div className="pt-2">
                  <button
                    disabled={loading || !!successMsg}
                    className="
                      w-full
                      bg-purple-600
                      text-white font-medium tracking-wide
                      py-3.5
                      rounded-xl
                      hover:bg-purple-700
                      focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2
                      transition-all duration-300 shadow-sm
                      flex items-center justify-center gap-2
                      disabled:opacity-70 disabled:cursor-not-allowed
                    "
                  >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            Sign Up <ArrowRight size={18} />
                        </>
                    )}
                  </button>
              </div>
              
              <div className="text-center pt-4">
                  <p className="text-slate-500 text-sm">
                      Already have an account?{' '}
                      <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                          Sign In
                      </Link>
                  </p>
              </div>
            </div>
          </form>
      </div>
    </div>
  )
}
