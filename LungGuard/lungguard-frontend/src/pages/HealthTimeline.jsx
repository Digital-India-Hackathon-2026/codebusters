import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, Loader2, ArrowRight, TrendingUp, TrendingDown, Calendar, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "react-router-dom";
import API from "../services/api";
import DashboardCard from "../components/DashboardCard";

function HealthTimeline() {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState("all"); // 7d, 30d, 6m, all

  const fetchTimeline = async (selectedRange) => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/timeline?range=${selectedRange}`);
      setTimelineData(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch timeline data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline(range);
  }, [range]);

  const getEventIcon = (type) => {
    switch (type) {
      case "Risk Assessment": return <Activity className="text-rose-400" size={20} />;
      case "X-ray Analysis": return <Activity className="text-cyan-400" size={20} />;
      case "CT Analysis": return <Activity className="text-purple-400" size={20} />;
      case "Health Simulation": return <Activity className="text-emerald-400" size={20} />;
      case "Recovery Check-in": return <Activity className="text-amber-400" size={20} />;
      default: return <Activity className="text-slate-400" size={20} />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "Risk Assessment": return "border-rose-500/30 bg-rose-500/5";
      case "X-ray Analysis": return "border-cyan-500/30 bg-cyan-500/5";
      case "CT Analysis": return "border-purple-500/30 bg-purple-500/5";
      case "Health Simulation": return "border-emerald-500/30 bg-emerald-500/5";
      case "Recovery Check-in": return "border-amber-500/30 bg-amber-500/5";
      default: return "border-slate-800 bg-slate-900/50";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading && !timelineData) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-3">
        <Loader2 size={40} className="animate-spin text-sky-400" />
        <span className="text-slate-405 font-medium">Aggregating Health History...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2">
            <Clock className="text-sky-400" /> Health Timeline
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your health events and risk trends over time.
          </p>
        </div>
        
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {[
            { value: "7d", label: "7 Days" },
            { value: "30d", label: "30 Days" },
            { value: "6m", label: "6 Months" },
            { value: "all", label: "All Time" }
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setRange(btn.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                range === btn.value 
                  ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Summary Cards */}
      {timelineData?.summary && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardCard 
            title="Latest Lung Risk" 
            value={timelineData.summary.latestLungRisk !== null ? `${timelineData.summary.latestLungRisk}%` : "N/A"} 
            icon={<Activity className="text-rose-400" size={18} />}
            colorClass="text-rose-400"
          />
          <DashboardCard 
            title="Latest Liver Risk" 
            value={timelineData.summary.latestLiverRisk !== null ? `${timelineData.summary.latestLiverRisk}%` : "N/A"} 
            icon={<Activity className="text-orange-400" size={18} />}
            colorClass="text-orange-400"
          />
          <DashboardCard 
            title="Risk Change" 
            value={timelineData.summary.lungRiskChange !== null ? `${timelineData.summary.lungRiskChange > 0 ? '+' : ''}${timelineData.summary.lungRiskChange}%` : "N/A"} 
            icon={
              timelineData.summary.lungRiskChange !== null ? (
                timelineData.summary.lungRiskChange > 0 ? <TrendingUp className="text-rose-400" size={18} /> 
                : <TrendingDown className="text-emerald-400" size={18} />
              ) : <Activity className="text-slate-400" size={18} />
            }
            colorClass={timelineData.summary.lungRiskChange !== null && timelineData.summary.lungRiskChange <= 0 ? "text-emerald-400" : "text-rose-400"}
            subtitle="From previous assessment"
          />
          <DashboardCard 
            title="Total Scans" 
            value={timelineData.summary.totalScans} 
            icon={<Activity className="text-cyan-400" size={18} />}
            colorClass="text-cyan-400"
          />
          <DashboardCard 
            title="Smoke-Free Streak" 
            value={timelineData.summary.smokeFreeStreak} 
            icon={<Activity className="text-amber-400" size={18} />}
            colorClass="text-amber-400"
            subtitle="Current active streak"
          />
        </div>
      )}

      {/* Risk Trend Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl h-[400px] flex flex-col">
        <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-sky-400" /> Risk Trend
        </h3>
        
        {timelineData?.riskTrend && timelineData.riskTrend.length > 0 ? (
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData.riskTrend} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }}
                  itemStyle={{ fontWeight: "bold" }}
                  cursor={{ stroke: "#334155", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
                <Line 
                  type="monotone" 
                  dataKey="lungRisk" 
                  name="Lung Risk Score"
                  stroke="#fb7185" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0f172a", stroke: "#fb7185", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#fb7185" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="liverRisk" 
                  name="Liver Risk Score"
                  stroke="#fb923c" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0f172a", stroke: "#fb923c", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#fb923c" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center text-slate-500">
            No risk assessment data available for this time range.
          </div>
        )}
      </div>

      {/* Timeline Events Feed */}
      <div>
        <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-sky-400" /> Event Feed
        </h3>
        
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-sky-400" size={30} /></div>
        ) : timelineData?.events && timelineData.events.length > 0 ? (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-800">
            {timelineData.events.map((event, index) => (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline Icon Marker */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 bg-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-slate-900/50 z-10">
                  {getEventIcon(event.type)}
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all hover:scale-[1.02] cursor-default bg-slate-900/40 border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md border ${getEventColor(event.type)}`}>
                      {event.type}
                    </span>
                    <time className="text-xs font-semibold text-slate-500">{formatDate(event.date)}</time>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-lg font-bold text-slate-200">{event.result}</h4>
                    {event.score && event.score !== "N/A" && (
                      <p className="text-sm font-semibold text-sky-400 mt-1">Score/Confidence: {event.score}</p>
                    )}
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <p className="text-sm text-slate-400">{event.note}</p>
                    {event.actionUrl && (
                      <Link to={event.actionUrl} className="text-sky-400 hover:text-sky-300 transition-colors p-1 bg-sky-400/10 rounded-lg hover:bg-sky-400/20">
                        <ArrowRight size={18} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center shadow-xl">
            <p className="text-slate-400">No health events recorded in this time range.</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="text-center pb-8 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">
          Timeline trends are based on saved AI assessments and tracked habits. They are not a medical diagnosis or confirmation of health improvement.
        </p>
      </div>

    </motion.div>
  );
}

export default HealthTimeline;
