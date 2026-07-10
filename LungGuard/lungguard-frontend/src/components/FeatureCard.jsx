import { motion } from "framer-motion";

function FeatureCard({ icon: Icon, title, description, colorClass, itemVariants }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-slate-900/40 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 p-6 rounded-2xl shadow-xl transition-all group hover:-translate-y-1 hover:shadow-cyan-900/20 h-full flex flex-col"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 group-hover:scale-110 transition-transform shrink-0 ${colorClass}`}>
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-bold text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-405 text-sm leading-relaxed flex-grow">
        {description}
      </p>
    </motion.div>
  );
}

export default FeatureCard;
