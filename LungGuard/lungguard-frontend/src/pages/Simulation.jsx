import { useState, useEffect } from "react";
import API from "../services/api";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";
import { Calendar, LineChart as ChartIcon, ArrowRight, ShieldAlert, Sparkles, DollarSign, Loader2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Simulation() {
  const [formData, setFormData] = useState({
    age: "",
    cigarettesPerDay: "10",
    smokingYears: "5",
    alcoholFrequency: "weekly",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await API.get("/simulation/history");
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      age: parseInt(formData.age, 10),
      cigarettesPerDay: parseInt(formData.cigarettesPerDay, 10),
      smokingYears: parseInt(formData.smokingYears, 10),
      alcoholFrequency: formData.alcoholFrequency,
    };

    try {
      const res = await API.post("/simulation/run", payload);
      setResult(res.data);
      fetchHistory(); // Refresh history table
    } catch (err) {
      console.error(err);
      setError("Failed to run simulation. Verify your values and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for line chart
  const getChartData = (data) => {
    if (!data) return [];
    return [
      { name: "Current", "Lung Capacity": 100, "COPD Risk": 0, "Cancer Risk": 0 },
      { name: "5 Years", "Lung Capacity": data.lungCapacityAfter5Years, "COPD Risk": data.copdRiskAfter5Years, "Cancer Risk": data.cancerRiskAfter5Years },
      { name: "10 Years", "Lung Capacity": data.lungCapacityAfter10Years, "COPD Risk": data.copdRiskAfter10Years, "Cancer Risk": data.cancerRiskAfter10Years },
    ];
  };

  const currentChartData = getChartData(result);

  return (
    <div className="relative max-w-5xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-405 rounded-xl">
          <ChartIcon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-100">Future Health Simulator</h1>
          <p className="text-slate-400 text-sm mt-1">Project the cumulative 5 & 10 year prognosis of your current smoking and drinking habits.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-950/40 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid lg:grid-cols-5 gap-8 items-stretch">
        {/* Form Panel */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3">Habit Parameters</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Age</label>
              <input
                type="number"
                name="age"
                required
                min={18}
                max={120}
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-slate-205 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cigarettes per Day</label>
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Smoking Duration (Years)</label>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alcohol Frequency</label>
              <select
                name="alcoholFrequency"
                value={formData.alcoholFrequency}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3.5 px-4 text-slate-205 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-sm h-[46px]"
              >
                <option value="never">Never</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center gap-2 w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/10 transition-all cursor-pointer text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Simulating Prognosis...
                </>
              ) : (
                <>
                  Run Simulation <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Projections Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full gap-6"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">Prognosis Chart</h3>
                    <p className="text-slate-400 text-xs">Estimated progression over the next decade.</p>
                  </div>
                  {/* Wallet Money Burned */}
                  <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-xl">
                    <DollarSign size={16} />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Capital Burned</div>
                      <div className="text-sm font-extrabold">${result.moneyBurned.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Area/Line Chart */}
                <div className="h-[250px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCopd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCancer" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                      <Area type="monotone" dataKey="Lung Capacity" stroke="#10b981" fillOpacity={1} fill="url(#colorCap)" strokeWidth={2} />
                      <Area type="monotone" dataKey="COPD Risk" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCopd)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Cancer Risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorCancer)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Recommendation */}
                <div className="bg-slate-950/60 border border-slate-850 p-4.5 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-sky-405" /> Diagnostic Report
                  </h4>
                  <p className="text-slate-305 text-xs leading-relaxed">{result.recommendation}</p>
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
                  <ChartIcon size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-300 mb-1">Awaiting Telemetry</h3>
                <p className="text-xs text-slate-450 max-w-[200px] mx-auto leading-relaxed">
                  Enter your stats on the left and start the simulation to see future projection maps.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* History table */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Calendar size={18} className="text-sky-400" /> Projections History
          </h3>
          <button 
            onClick={fetchHistory}
            className="p-1.5 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw size={16} className={historyLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {historyLoading && history.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">Loading simulation history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
            No previous simulations saved. Perform your first simulation run to log data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-350">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 pt-1">Date</th>
                  <th className="pb-3 pt-1">Age</th>
                  <th className="pb-3 pt-1">Cigarettes/Day</th>
                  <th className="pb-3 pt-1">Smoking Years</th>
                  <th className="pb-3 pt-1">Lung Cap (10Y)</th>
                  <th className="pb-3 pt-1">Cancer Risk (10Y)</th>
                  <th className="pb-3 pt-1">COPD Risk (10Y)</th>
                  <th className="pb-3 pt-1">Money Burned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3.5">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5">{row.age}</td>
                    <td className="py-3.5">{row.cigarettesPerDay}</td>
                    <td className="py-3.5">{row.smokingYears}</td>
                    <td className={`py-3.5 font-bold ${row.lungCapacityAfter10Years < 60 ? "text-red-400" : "text-emerald-400"}`}>{row.lungCapacityAfter10Years}%</td>
                    <td className="py-3.5">{row.cancerRiskAfter10Years}%</td>
                    <td className="py-3.5">{row.copdRiskAfter10Years}%</td>
                    <td className="py-3.5 text-rose-400 font-bold">${row.moneyBurned.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Simulation;