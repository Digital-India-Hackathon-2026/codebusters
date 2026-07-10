import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity } from "lucide-react";

function ProgressChart({ checkIns }) {
  const [timeRange, setTimeRange] = useState(7);

  if (!checkIns || checkIns.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl h-64 flex items-center justify-center">
        <p className="text-slate-400">Complete daily check-ins to see your trend</p>
      </div>
    );
  }

  // Filter and sort data based on time range
  const sortedData = [...checkIns]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-timeRange)
    .map(ci => ({
      ...ci,
      displayDate: new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Activity size={18} className="text-sky-400" /> Craving Trend
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 7 
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" 
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeRange === 30 
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" 
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              domain={[0, 10]} 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: "#0f172a", 
                border: "1px solid #1e293b", 
                borderRadius: "12px", 
                color: "#f8fafc",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)"
              }}
              itemStyle={{ color: "#38bdf8", fontWeight: "bold" }}
              cursor={{ stroke: "#334155", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Line 
              type="monotone" 
              dataKey="cravingLevel" 
              name="Craving Level (1-10)"
              stroke="#0ea5e9" 
              strokeWidth={3}
              dot={{ r: 4, fill: "#0f172a", stroke: "#0ea5e9", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#38bdf8", stroke: "#0284c7" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProgressChart;
