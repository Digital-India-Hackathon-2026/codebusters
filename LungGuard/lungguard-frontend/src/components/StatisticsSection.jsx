import { useEffect, useState, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const CountUpNumber = ({ value, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();
  const numericValue = parseInt(value, 10);

  useEffect(() => {
    if (prefersReducedMotion || !isInView || isNaN(numericValue)) {
      setCount(numericValue || value);
      return;
    }

    let startTimestamp = null;
    const duration = 1500; // 1.5s

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * numericValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, numericValue, prefersReducedMotion, value]);

  if (isNaN(numericValue)) {
    return <span>{value}</span>;
  }

  return <span>{prefix}{count}{suffix}</span>;
};

const statsData = [
  {
    value: "3",
    title: "AI Models",
    description: "Risk prediction, X-ray screening, and health simulation"
  },
  {
    value: "10",
    suffix: "+",
    title: "Risk Factors",
    description: "Lifestyle, symptoms, medical indicators, and habits analyzed"
  },
  {
    value: "6",
    title: "Health Modules",
    description: "Risk, X-ray, simulation, timeline, recovery, and AI copilot"
  },
  {
    value: "360",
    suffix: "°",
    title: "Visualization",
    description: "Interactive anatomical lung-model exploration"
  },
  {
    value: "Explainable",
    title: "AI",
    description: "Grad-CAM attention heatmaps for X-ray predictions"
  },
  {
    value: "Real-Time",
    title: "Results",
    description: "Fast communication between React, Spring Boot, and FastAPI"
  }
];

function StatisticsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="py-20 w-full">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-slate-100 mb-3">
          LungGuard AI — Prototype Performance
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          A unified AI-powered system for screening, prediction, explainability, and preventive health guidance.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{
              y: -6,
              boxShadow: "0 14px 35px rgba(6,182,212,0.12)"
            }}
            className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border border-slate-800 hover:border-cyan-400/45 p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 ease-in-out group"
          >
            <div className="flex items-baseline gap-1 text-3xl font-black text-sky-400 mb-1 transform transition-transform group-hover:scale-105">
              <CountUpNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
            </div>
            <h4 className="text-sm font-bold text-slate-200 mb-2 uppercase tracking-wide">{stat.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{stat.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default StatisticsSection;
