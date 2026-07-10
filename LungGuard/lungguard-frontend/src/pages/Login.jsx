import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", formData);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: res.data.email,
            fullName: res.data.fullName,
          })
        );
        navigate("/dashboard");
      } else if (res.data.error) {
        setError(res.data.error);
      } else {
        setError("An unexpected authentication error occurred.");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to connect to the authentication server. Please verify your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 p-8 sm:p-10 rounded-2xl shadow-2xl max-w-md w-full z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-2xl mb-4">
            <LogIn size={26} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-2">Log in to consult your health dashboard</p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-950/40 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm mb-6 animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-550" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-650 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-550" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-10 text-slate-200 placeholder-slate-650 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-550 hover:text-slate-350 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center gap-2 w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/10 transition-all cursor-pointer text-sm mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-slate-800/60 text-sm">
          <span className="text-slate-400">New to LungGuard? </span>
          <Link to="/register" className="text-sky-400 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;