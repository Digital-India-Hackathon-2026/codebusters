import { Link } from "react-router-dom";
import { Shield, Brain, Heart, ArrowRight, Activity, CheckCircle, ScanSearch, TrendingUp, Bot } from "lucide-react";
import { motion } from "framer-motion";
import lungBg from "../assets/lung-bg.png";
import FeatureCard from "../components/FeatureCard";
import StatisticsSection from "../components/StatisticsSection";
import CTASection from "../components/CTASection";

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

  const featureData = [
    {
      title: "ML Risk Scoring",
      description: "Trains an intelligent RandomForest model analyzing age, weight, symptoms, and habits to evaluate lung and liver integrity.",
      icon: Shield,
      colorClass: "text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      title: "CNN X-ray Scanner",
      description: "Employs PyTorch ResNet18 neural network classifier to screen chest scans for signs of Pneumonia or malignancies.",
      icon: Brain,
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Habit Prognosis",
      description: "Simulates future lung capacities, COPD risks, and monetary spending across 5 & 10 years to encourage positive changes.",
      icon: Heart,
      colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
    },
    {
      title: "Grad-CAM Visual Analysis",
      description: "Highlights the chest X-ray regions that influenced the AI prediction, making the model's analysis easier to understand.",
      icon: ScanSearch,
      colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    },
    {
      title: "Health Timeline & Risk Trends",
      description: "Combines risk assessments, X-ray results, simulations, and recovery progress into a unified health timeline.",
      icon: TrendingUp,
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "AI Health Copilot",
      description: "Explains health results, risk factors, reports, and preventive actions through a simple conversational assistant.",
      icon: Bot,
      colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20"
    }
  ];

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
        <div className="features-section py-8 px-4 sm:px-0 rounded-3xl mt-12">
          
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-100 mb-3">
              Everything You Need for Smarter Lung Health
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              Intelligent screening, visual explanations, health tracking, and personalized guidance in one secure platform.
            </p>
          </div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
          >
            {featureData.map((feature, index) => (
              <FeatureCard 
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                colorClass={feature.colorClass}
                itemVariants={itemVariants}
              />
            ))}
          </motion.div>

          <StatisticsSection />

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

          <CTASection />
        </div>
      </motion.div>
    </div>
  );
}

export default Home;