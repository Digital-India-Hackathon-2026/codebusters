import { motion } from "framer-motion";

function TrackerStatCard({ title, value, icon, colorClass, borderClass, subtitle, trend, suffix }) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-slate-900/50 backdrop-blur-md border ${borderClass || "border-slate-850"} p-6 rounded-2xl shadow-xl flex flex-col justify-between h-full`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${colorClass} border border-current/20 bg-current/5`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1 mb-1">
            <h3 className="text-3xl font-black tracking-tight text-slate-100">{value}</h3>
            {suffix && <span className="text-sm font-semibold text-slate-400">{suffix}</span>}
        </div>
        {subtitle && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {trend && <span className={`${trend.includes('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{trend}</span>}
                {subtitle}
            </p>
        )}
      </div>
    </motion.div>
  );
}

export default TrackerStatCard;
