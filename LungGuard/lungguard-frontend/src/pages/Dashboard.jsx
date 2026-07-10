import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardCard from "../components/DashboardCard";
import { Link } from "react-router-dom";
import { LayoutDashboard, ShieldAlert, Heart, Calendar, MessageSquare, ArrowRight, Loader2, Sparkles, Activity, Target, Clock, GitCompare } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => {
        setDashboard(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch dashboard data. Please try running a Risk Assessment first!");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-3">
        <Loader2 size={40} className="animate-spin text-sky-400" />
        <span className="text-slate-405 font-medium">Aggregating health telemetry...</span>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl max-w-xl mx-auto my-12 text-center shadow-xl">
        <ShieldAlert className="mx-auto mb-4 text-amber-500" size={44} />
        <h3 className="text-xl font-bold mb-2 text-slate-100">No Assessment Data Available</h3>
        <p className="text-slate-400 mb-6 leading-relaxed">
          It looks like you haven't completed any health risk assessments yet. Let's calculate your first scores to populate your dashboard metrics!
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            to="/risk" 
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
          >
            Start Risk Assessment
          </Link>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Lung Risk", score: dashboard.latestLungRiskScore, fill: "#f43f5e" },
    { name: "Liver Risk", score: dashboard.latestLiverRiskScore, fill: "#f97316" },
  ];

  const categoryColors = {
    LOW: "text-emerald-400 border-emerald-500/25",
    MEDIUM: "text-amber-405 border-amber-500/25",
    HIGH: "text-rose-400 border-rose-500/25",
  };

  const currentCategoryColor = categoryColors[dashboard.latestRiskCategory] || "text-slate-400 border-slate-850";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="text-sky-405" /> Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <span className="text-sky-400 font-semibold">{user?.fullName || "User"}</span>. Here is your medical AI evaluation overview.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Lung Risk Score" 
          value={`${dashboard.latestLungRiskScore}%`} 
          icon={<Heart className="text-rose-455" size={18} />}
          colorClass="text-rose-455"
          subtitle="Latest assessment score"
        />
        <DashboardCard 
          title="Liver Risk Score" 
          value={`${dashboard.latestLiverRiskScore}%`} 
          icon={<Activity className="text-orange-455" size={18} />}
          colorClass="text-orange-455"
          subtitle="Latest assessment score"
        />
        <DashboardCard 
          title="Risk Category" 
          value={dashboard.latestRiskCategory} 
          icon={<ShieldAlert className={currentCategoryColor.split(" ")[0]} size={18} />}
          colorClass={currentCategoryColor.split(" ")[0]}
          borderClass={`border ${currentCategoryColor.split(" ")[1]}`}
          subtitle="System diagnostic category"
        />
        <DashboardCard 
          title="Total Assessments" 
          value={dashboard.totalAssessments.toString()} 
          icon={<Calendar className="text-sky-400" size={18} />}
          colorClass="text-sky-400"
          subtitle="Assessments logged to date"
        />
      </div>

      {/* Analytics & Quick Action Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6 shadow-xl flex flex-col">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-sky-405" /> Risk Comparison
          </h2>
          <div className="flex-grow min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }}
                  itemStyle={{ color: "#38bdf8" }}
                  cursor={{ fill: "rgba(30, 41, 59, 0.3)" }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col gap-6">
          {/* AI Recommendations */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6 shadow-xl flex-grow flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-sky-455" /> Health Advice
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {dashboard.latestRecommendation}
              </p>
            </div>
            
            <Link 
              to="/risk" 
              className="flex justify-center items-center gap-2 py-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-400 hover:text-sky-300 font-semibold rounded-xl text-sm transition-all"
            >
              Update Telemetry <ArrowRight size={16} />
            </Link>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-sky-405" /> Medical Actions
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Link 
                to="/risk" 
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs text-center font-bold text-slate-350 hover:text-sky-400 transition-all flex flex-col gap-2 justify-center items-center"
              >
                <Heart size={20} className="text-rose-400" /> Calc Risk
              </Link>
              <Link 
                to="/simulation" 
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs text-center font-bold text-slate-350 hover:text-sky-400 transition-all flex flex-col gap-2 justify-center items-center"
              >
                <Activity size={20} className="text-emerald-450" /> Simulator
              </Link>
              <Link 
                to="/xray" 
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs text-center font-bold text-slate-350 hover:text-sky-400 transition-all flex flex-col gap-2 justify-center items-center"
              >
                <Activity size={20} className="text-cyan-450" /> X-ray Scan
              </Link>
              <Link 
                to="/chat" 
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs text-center font-bold text-slate-350 hover:text-sky-400 transition-all flex flex-col gap-2 justify-center items-center"
              >
                <MessageSquare size={20} className="text-sky-400" /> Chat Copilot
              </Link>
              <Link 
                to="/tracker" 
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs text-center font-bold text-slate-350 hover:text-sky-400 transition-all flex flex-col gap-2 justify-center items-center"
              >
                <Target size={20} className="text-purple-400" /> Tracker
              </Link>
              <Link 
                to="/timeline" 
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs text-center font-bold text-slate-350 hover:text-sky-400 transition-all flex flex-col gap-2 justify-center items-center"
              >
                <Clock size={20} className="text-amber-400" /> Timeline
              </Link>
              <Link 
                to="/scan-comparison" 
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs text-center font-bold text-slate-350 hover:text-sky-400 transition-all flex flex-col gap-2 justify-center items-center"
              >
                <GitCompare size={20} className="text-pink-400" /> Compare
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;