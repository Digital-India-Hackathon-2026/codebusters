import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Upload } from "lucide-react";
import { motion } from "framer-motion";
import ctaImage from "../assets/cta-image.png";

function CTASection() {
  const token = localStorage.getItem("token");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="py-20 w-full border-t border-slate-800">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Soft glowing background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="grid md:grid-cols-2 gap-10 items-center">
          
          {/* Left Text Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="p-10 md:p-14 z-10"
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-black text-slate-100 mb-5 leading-tight">
              Take Control of Your <span className="text-cyan-400">Lung Health</span>
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-slate-400 mb-8 text-lg leading-relaxed">
              Use AI-powered risk assessment, X-ray screening, health simulations, and personalized guidance to understand your respiratory health earlier.
            </motion.p>
            
            <motion.div variants={itemVariants} className="space-y-4 mb-10">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                <span className="text-slate-300 font-medium">Early risk identification</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                <span className="text-slate-300 font-medium">Explainable AI analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                <span className="text-slate-300 font-medium">Personalized preventive guidance</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link
                to={token ? "/risk" : "/login"}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all text-center"
              >
                Start Free Assessment <ArrowRight size={18} />
              </Link>
              <Link
                to={token ? "/xray" : "/login"}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl transition-all text-center"
              >
                <Upload size={18} /> Analyze an X-ray
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Image Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="h-full min-h-[300px] md:min-h-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900/80 md:hidden z-10" />
            <img 
              src={ctaImage} 
              alt="Doctor using AI analysis" 
              className="absolute inset-0 w-full h-full object-cover object-center border-l border-slate-800/50"
            />
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}

export default CTASection;
