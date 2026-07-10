import { Link } from "react-router-dom";
import { Shield, Brain, Heart, ArrowRight, Activity, Zap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import lungBg from "../assets/lung-bg.png";

function Home() {
  const token = localStorage.getItem("token");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col justify-center py-10">


      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center z-10"
      >
        {/* Hero Section */}
        <div className="hero-section w-full pt-20 md:pt-24 pb-28">
          {/* Lung Background Image */}
          <img
            src={lungBg}
            alt=""
            aria-hidden="true"
            className="lung-background hidden sm:block"
          />

          {/* Hero Section */}



          <div className="hero-content">
            {/* Active Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-400/20 text-sky-400 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 shadow-sm shadow-sky-500/5">
              <Activity size={12} className="animate-pulse" /> Next-Gen Medical Assistant
            </motion.div>

            {/* Hero Title */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-slate-100 mb-6"
            >
              Your Intelligent Copilot for <br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Lung & Liver Protection
              </span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              LungGuard AI uses machine learning and computer vision to predict chronic risks, simulate future health consequences of habits, and review diagnostic chest X-rays.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={token ? "/dashboard" : "/register"}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/10 transition-all cursor-pointer"
              >
                {token ? "Go to Dashboard" : "Create Free Account"} <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-350 font-bold rounded-xl transition-all cursor-pointer"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Features Section Wrapper */}
        <div className="features-section py-8 px-4 sm:px-0 rounded-3xl">
          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-6 text-left"
          >
            <motion.div
              variants={itemVariants}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 p-6 rounded-2xl shadow-xl transition-all group"
            >
              <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20 text-sky-400 mb-5 group-hover:scale-110 transition-transform">
                <Shield size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">ML Risk Scoring</h3>
              <p className="text-slate-405 text-sm leading-relaxed">
                Trains an intelligent RandomForest model analyzing age, weight, symptoms, and habits to evaluate lung and liver integrity.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 p-6 rounded-2xl shadow-xl transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Brain size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">CNN X-ray Scanner</h3>
              <p className="text-slate-405 text-sm leading-relaxed">
                Employs PyTorch ResNet18 neural network classifier to screen chest scans for signs of Pneumonia or malignancies.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 p-6 rounded-2xl shadow-xl transition-all group"
            >
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Heart size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Habit Prognosis</h3>
              <p className="text-slate-405 text-sm leading-relaxed">
                Simulates future lung capacities, COPD risks, and monetary spending across 5 & 10 years to encourage positive changes.
              </p>
            </motion.div>
          </motion.div>

          {/* Quality list */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs font-semibold text-slate-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" /> Safe Clinical Guardrails
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" /> Real-Time ML Predictions
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" /> Secure Encryption
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;