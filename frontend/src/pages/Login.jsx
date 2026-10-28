import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiShield, FiPieChart, FiTrendingUp } from "react-icons/fi";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-[#09090b] font-sans">
      
      {/* ========================================= */}
      {/* PURE CSS ANIMATED BACKGROUND              */}
      {/* ========================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated Mesh Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-violet-600/40 blur-[120px] animate-blob-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-indigo-600/40 blur-[120px] animate-blob-2" />
        <div className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-fuchsia-600/30 blur-[120px] animate-blob-3" />
        <div className="absolute top-[10%] right-[20%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full bg-emerald-600/20 blur-[120px] animate-blob-4" />
        
        {/* Subtle Noise Overlay for texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* --- Main Container (Bento Grid) --- */}
      <div className="relative z-10 w-full max-w-[1100px] grid lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Left Side: Brand & Features */}
        <div className="hidden lg:flex flex-col justify-between p-10 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-2xl animate-slide-in-left">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <FiPieChart size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Expense<span className="text-indigo-400">Tracker</span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight drop-shadow-lg">
              Master your money, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-fuchsia-300">
                shape your future.
              </span>
            </h1>
            <p className="text-slate-200/80 text-lg leading-relaxed mb-10 max-w-sm drop-shadow-md">
              Join thousands of users who have transformed their financial habits with our intelligent tracking and budgeting tools.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/[0.05] border border-white/10 p-4 rounded-2xl backdrop-blur-md transition-transform hover:scale-[1.02] duration-300">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FiTrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Smart Analytics</h3>
                <p className="text-slate-300 text-xs mt-0.5">Visualize your spending trends.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/[0.05] border border-white/10 p-4 rounded-2xl backdrop-blur-md transition-transform hover:scale-[1.02] duration-300">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <FiShield size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Bank-Grade Security</h3>
                <p className="text-slate-300 text-xs mt-0.5">Your data is encrypted and safe.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 rounded-[2.5rem] bg-[var(--card-background)] shadow-2xl border border-[var(--border-color)] relative overflow-hidden animate-slide-in-right">
          
          <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--primary-color)]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
             <div className="h-10 w-10 rounded-xl bg-[var(--primary-color)] flex items-center justify-center text-white shadow-lg">
                <FiPieChart size={20} />
              </div>
              <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                ExpenseTracker
              </span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>
              Welcome back
            </h2>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Please enter your details to access your dashboard.
            </p>
          </div>

          {error && (
            <div 
              className="mb-6 p-4 rounded-xl text-sm font-semibold flex items-center justify-center lg:justify-start gap-3 border animate-shake"
              style={{
                backgroundColor: "var(--danger-light-bg)",
                color: "var(--danger-color)",
                borderColor: "var(--danger-color)",
              }}
            >
              <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" htmlFor="email" style={{ color: "var(--text-primary)" }}>
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--primary-color)]" style={{ color: "var(--text-secondary)" }}>
                  <FiMail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all duration-300 focus:ring-4"
                  style={{
                    backgroundColor: "var(--input-background)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                    "--tw-ring-color": "rgba(99, 102, 241, 0.15)",
                  }}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold" htmlFor="password" style={{ color: "var(--text-primary)" }}>
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[var(--primary-color)]" style={{ color: "var(--text-secondary)" }}>
                  <FiLock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all duration-300 focus:ring-4"
                  style={{
                    backgroundColor: "var(--input-background)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                    "--tw-ring-color": "rgba(99, 102, 241, 0.15)",
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all duration-300 text-white disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-2"
              style={{
                backgroundColor: "var(--primary-color)",
                boxShadow: "0 8px 20px -8px var(--primary-color)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 25px -8px var(--primary-color)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 20px -8px var(--primary-color)";
                }
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                   Authenticating...
                </span>
              ) : (
                <>
                  <span className="relative z-10">Sign In</span>
                  <FiArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Don't have an account?{" "}
              <Link to="/register" className="font-bold transition hover:opacity-80" style={{ color: "var(--primary-color)" }}>
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* --- Animations --- */}
      <style>
        {`
          /* Morphing Blob Animations */
          @keyframes blob1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(50px, -60px) scale(1.1); }
            66% { transform: translate(-30px, 30px) scale(0.9); }
          }
          @keyframes blob2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-50px, 60px) scale(1.15); }
            66% { transform: translate(30px, -30px) scale(0.85); }
          }
          @keyframes blob3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(40px, 40px) scale(1.2); }
          }
          @keyframes blob4 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-40px, -40px) scale(1.1); }
          }
          
          .animate-blob-1 { animation: blob1 25s ease-in-out infinite; }
          .animate-blob-2 { animation: blob2 30s ease-in-out infinite; }
          .animate-blob-3 { animation: blob3 20s ease-in-out infinite; }
          .animate-blob-4 { animation: blob4 22s ease-in-out infinite; }

          /* Entrance Animations */
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-40px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(40px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-left { animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-slide-in-right { animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

          /* Shake */
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake { animation: shake 0.4s ease-in-out; }
        `}
      </style>
    </div>
  );
}

export default Login;