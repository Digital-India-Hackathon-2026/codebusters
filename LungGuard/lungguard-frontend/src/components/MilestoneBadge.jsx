import { Award, Lock } from "lucide-react";

function MilestoneBadge({ milestone, isEarned }) {
  return (
    <div 
      className={`relative p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 ${
        isEarned 
          ? "bg-cyan-950/30 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
          : "bg-slate-900/40 border-slate-800 opacity-60 grayscale"
      }`}
    >
      <div className={`p-3 rounded-full mb-3 ${isEarned ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-500"}`}>
        {isEarned ? <Award size={24} /> : <Lock size={24} />}
      </div>
      <span className={`text-sm font-bold ${isEarned ? "text-slate-200" : "text-slate-500"}`}>
        {milestone}
      </span>
      <span className="text-xs text-slate-400 mt-1">
        {isEarned ? "Achieved" : "Locked"}
      </span>
    </div>
  );
}

export default MilestoneBadge;
