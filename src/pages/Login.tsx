import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";

export default function Login(){
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();
    setErrorMsg("");
    try {
      setLoading(true);

      const result = await login({
        email,
        password,
      });

      localStorage.setItem("token", result.access_token);
      navigate("/");
    } catch (err) {
      setErrorMsg("Login gagal. Periksa kembali email dan password Anda.");
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
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-100 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10 px-6">
          <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white border border-slate-200 rounded-2xl mb-4 shadow-sm">
                  <Sparkles className="text-blue-600" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-slate-500 text-sm">Sign in to BIPA Audio Analytics CMS</p>
          </div>

          <form
            onSubmit={handleLogin}
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

            <div className="space-y-5">
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
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
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white
                      transition-all duration-300"
                  />
              </div>

              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
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
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white
                    transition-all duration-300
                  "
                  />
              </div>

              <div className="pt-2">
                  <button
                    disabled={loading}
                    className="
                      w-full
                      bg-blue-600
                      text-white font-medium tracking-wide
                      py-3.5
                      rounded-xl
                      hover:bg-blue-700
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
                      transition-all duration-300 shadow-sm
                      flex items-center justify-center gap-2
                      disabled:opacity-70 disabled:cursor-not-allowed
                    "
                  >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            Sign In <ArrowRight size={18} />
                        </>
                    )}
                  </button>
              </div>

              <div className="text-center pt-4">
                  <p className="text-slate-500 text-sm">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                          Sign Up
                      </Link>
                  </p>
              </div>
            </div>
          </form>
      </div>
    </div>
  )
}