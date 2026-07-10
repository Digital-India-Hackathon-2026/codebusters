import { motion } from "framer-motion";

function DashboardCard({ title, value, icon, colorClass, borderClass, subtitle }) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-slate-900/50 backdrop-blur-md border ${borderClass || "border-slate-850"} p-6 rounded-2xl shadow-xl flex flex-col justify-between`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${colorClass} border border-current/20 bg-current/5`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black tracking-tight text-slate-100 mb-1">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

export default DashboardCard;