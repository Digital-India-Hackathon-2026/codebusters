import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-950/40 rounded-full border border-red-500/20 text-red-400">
            <AlertCircle size={48} />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-slate-100 mb-2 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-300 mb-4">Page Not Found</h2>
        
        <p className="text-slate-400 mb-8 leading-relaxed">
          The health corridor you're looking for does not exist or has been relocated. Let's get you back on track.
        </p>
        
        <div className="flex gap-4">
          <Link 
            to="/" 
            className="flex-1 px-4 py-3 bg-slate-850 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl transition-all duration-200 border border-slate-700 text-center"
          >
            Go Home
          </Link>
          <Link 
            to="/dashboard" 
            className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all duration-200 text-center"
          >
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFound;
