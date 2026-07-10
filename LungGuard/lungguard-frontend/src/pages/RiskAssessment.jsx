import { useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { Calculator, ArrowRight, ShieldAlert, Heart, Calendar, Activity, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function RiskAssessment() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    weight: "",
    cigarettesPerDay: "0",
    smokingYears: "0",
    alcoholFrequency: "never",
    hasCough: false,
    hasChestPain: false,
    hasBreathlessness: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      ...formData,
      age: parseInt(formData.age, 10),
      weight: parseFloat(formData.weight),
      cigarettesPerDay: parseInt(formData.cigarettesPerDay, 10),
      smokingYears: parseInt(formData.smokingYears, 10),
    };

    try {
      const res = await API.post("/risk/calculate", payload);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to calculate risk. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    LOW: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    MEDIUM: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    HIGH: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400",
  };

  const getScoreColor = (score) => {
    if (score <= 30) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score <= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="relative max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
          <Calculator size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-100">Health Risk Assessment</h1>
          <p className="text-slate-400 text-sm mt-1">Compute your direct lung & liver risk scores based on ML Random Forest models.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-950/40 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm mb-6">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-8 items-stretch">
        {/* Form panel */}
        <div className="md:col-span-3 bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Activity size={18} className="text-sky-400" /> Health Parameters
            </h2>

            {/* Demographics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 col-span-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</label>
                <input
                  type="number"
                  name="age"
                  required
                  min={18}
                  max={120}
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="35"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  required
                  step="0.1"
                  min={30}
                  max={250}
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-3 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-sm h-[46px]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Smoking Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cigarettes / Day</label>
                <input
                  type="number"
                  name="cigarettesPerDay"
                  required
                  min={0}
                  max={100}
                  value={formData.cigarettesPerDay}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-slate-205 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Smoking Years</label>
                <input
                  type="number"
                  name="smokingYears"
                  required
                  min={0}
                  max={80}
                  value={formData.smokingYears}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-slate-205 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Alcohol frequency */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alcohol Frequency</label>
              <select
                name="alcoholFrequency"
                value={formData.alcoholFrequency}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-sm h-[46px]"
              >
                <option value="never">Never</option>
                <option value="monthly">Monthly (Occasional)</option>
                <option value="weekly">Weekly (Moderate)</option>
                <option value="daily">Daily (Chronic)</option>
              </select>
            </div>

            {/* Symptoms */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Symptoms</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 p-3 bg-slate-950/50 hover:bg-slate-955 border border-slate-850 rounded-xl cursor-pointer select-none transition-all">
                  <input
                    type="checkbox"
                    name="hasCough"
                    checked={formData.hasCough}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500/20 focus:ring-offset-0 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-300">Persistent Cough</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-950/50 hover:bg-slate-955 border border-slate-850 rounded-xl cursor-pointer select-none transition-all">
                  <input
                    type="checkbox"
                    name="hasChestPain"
                    checked={formData.hasChestPain}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500/20 focus:ring-offset-0 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-300">Chest Pain</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-950/50 hover:bg-slate-955 border border-slate-850 rounded-xl cursor-pointer select-none transition-all">
                  <input
                    type="checkbox"
                    name="hasBreathlessness"
                    checked={formData.hasBreathlessness}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500/20 focus:ring-offset-0 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-300">Short of Breath</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center gap-2 w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/10 transition-all cursor-pointer text-sm mt-3"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Evaluating ML Risk Models...
                </>
              ) : (
                <>
                  Analyze My Risks <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results panel */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 h-full flex flex-col justify-between"
              >
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Result</span>
                  <div className={`mt-3 py-2 px-4 border rounded-full font-bold inline-flex items-center gap-1.5 text-sm bg-gradient-to-r ${categoryColors[result.riskCategory] || "text-slate-400"}`}>
                    <ShieldAlert size={16} /> {result.riskCategory} RISK
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Score meters */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5"><Heart size={14} className="text-rose-500" /> Lung Risk</span>
                      <span className={`px-2 py-0.5 border text-xs font-bold rounded-lg ${getScoreColor(result.lungRiskScore)}`}>
                        {result.lungRiskScore}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.lungRiskScore}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          result.lungRiskScore <= 30 ? "bg-emerald-500" :
                          result.lungRiskScore <= 60 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5"><Activity size={14} className="text-orange-550" /> Liver Risk</span>
                      <span className={`px-2 py-0.5 border text-xs font-bold rounded-lg ${getScoreColor(result.liverRiskScore)}`}>
                        {result.liverRiskScore}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.liverRiskScore}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          result.liverRiskScore <= 30 ? "bg-emerald-500" :
                          result.liverRiskScore <= 60 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Recommendation */}
                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex-grow flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-sky-450" /> AI Recommendation
                  </h4>
                  <p className="text-slate-350 text-sm leading-relaxed">{result.recommendation}</p>
                </div>

                {/* Navigation actions */}
                <div className="flex gap-3 pt-2">
                  <Link 
                    to="/dashboard" 
                    className="flex-1 text-center py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/simulation" 
                    className="flex-1 text-center py-2.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-400 hover:text-sky-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Simulate Projections
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-900 border-dashed p-8 rounded-2xl shadow-xl text-center flex flex-col justify-center items-center h-full min-h-[350px]"
              >
                <div className="p-4 bg-slate-950/60 rounded-full border border-slate-850 text-slate-505 mb-4 animate-pulse">
                  <Calculator size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-300 mb-1">Awaiting Telemetry</h3>
                <p className="text-xs text-slate-450 max-w-[200px] mx-auto leading-relaxed">
                  Fill in your metrics and click evaluate to review your detailed ML assessment model.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default RiskAssessment;