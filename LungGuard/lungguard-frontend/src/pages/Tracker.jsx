import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Loader2, Sparkles, Activity, Plus, FileText, ChevronDown, ChevronUp, Settings } from "lucide-react";
import API from "../services/api";
import TrackerStatCard from "../components/TrackerStatCard";
import DailyCheckInForm from "../components/DailyCheckInForm";
import ProgressChart from "../components/ProgressChart";
import MilestoneBadge from "../components/MilestoneBadge";

function Tracker() {
  const [trackerData, setTrackerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  // Setup form state
  const [setupData, setSetupData] = useState({
    quitSmokingDate: "",
    quitAlcoholDate: "",
    cigarettesPerDay: 0,
    pricePerCigarette: 0,
    cigarettesPerPacket: 20,
    drinksPerWeek: 0,
    costPerDrink: 0,
    currency: "$",
    dailyGoal: "",
    motivationMessage: ""
  });

  const fetchTracker = async () => {
    try {
      const res = await API.get("/tracker");
      setTrackerData(res.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 500 || err.response?.status === 404) {
        // No tracker exists or not found -> show setup
        setTrackerData(null);
      } else {
        setError("Failed to fetch tracker data.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracker();
  }, []);

  const handleSetupChange = (e) => {
    const { name, value, type } = e.target;
    setSetupData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setIsSettingUp(true);
    setError("");
    try {
      // Create date objects but format as YYYY-MM-DD
      const payload = { ...setupData };
      if (!payload.quitSmokingDate) delete payload.quitSmokingDate;
      if (!payload.quitAlcoholDate) delete payload.quitAlcoholDate;

      let res;
      if (isEditing) {
        res = await API.put("/tracker/setup", payload);
        setIsEditing(false);
      } else {
        res = await API.post("/tracker/setup", payload);
      }
      setTrackerData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save tracker settings.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleEditClick = () => {
    setSetupData({
      quitSmokingDate: trackerData.quitSmokingDate || "",
      quitAlcoholDate: trackerData.quitAlcoholDate || "",
      cigarettesPerDay: trackerData.cigarettesPerDay || 0,
      pricePerCigarette: trackerData.pricePerCigarette || 0,
      cigarettesPerPacket: trackerData.cigarettesPerPacket || 20,
      drinksPerWeek: trackerData.drinksPerWeek || 0,
      costPerDrink: trackerData.costPerDrink || 0,
      currency: trackerData.currency || "$",
      dailyGoal: trackerData.dailyGoal || "",
      motivationMessage: trackerData.motivationMessage || ""
    });
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-3">
        <Loader2 size={40} className="animate-spin text-sky-400" />
        <span className="text-slate-405 font-medium">Loading Recovery Tracker...</span>
      </div>
    );
  }

  const allMilestones = [
    "1 day", "3 days", "7 days", "14 days", 
    "30 days", "60 days", "90 days", "6 months", "1 year"
  ];

  if (!trackerData || isEditing) {
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2">
            <Target className="text-emerald-400" /> {isEditing ? "Edit Tracker Settings" : "Recovery Tracker Setup"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isEditing ? "Update your habit tracking preferences." : "Start tracking your habit journey today. Fill in the details to customize your dashboard."}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSetupSubmit} className="space-y-6">
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Smoking Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Smoking History</h3>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Quit Date</label>
                  <input type="date" name="quitSmokingDate" value={setupData.quitSmokingDate} onChange={handleSetupChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Cigarettes Per Day</label>
                  <input type="number" name="cigarettesPerDay" min="0" value={setupData.cigarettesPerDay} onChange={handleSetupChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Price Per Cigarette ($)</label>
                  <input type="number" step="0.01" name="pricePerCigarette" min="0" value={setupData.pricePerCigarette} onChange={handleSetupChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                </div>
              </div>

              {/* Alcohol Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2">Alcohol History</h3>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Quit Date</label>
                  <input type="date" name="quitAlcoholDate" value={setupData.quitAlcoholDate} onChange={handleSetupChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Drinks Per Week</label>
                  <input type="number" name="drinksPerWeek" min="0" value={setupData.drinksPerWeek} onChange={handleSetupChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Average Cost Per Drink ($)</label>
                  <input type="number" step="0.01" name="costPerDrink" min="0" value={setupData.costPerDrink} onChange={handleSetupChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Currency</label>
                  <select name="currency" value={setupData.currency} onChange={handleSetupChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200">
                    <option value="$">$ (USD)</option>
                    <option value="₹">₹ (INR)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                  </select>
                </div>
               <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Daily Goal</label>
                  <input type="text" name="dailyGoal" placeholder="e.g., Drink water instead of smoking" value={setupData.dailyGoal} onChange={handleSetupChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Motivation Message (Why are you quitting?)</label>
                  <textarea name="motivationMessage" rows="2" placeholder="e.g., For my health and family" value={setupData.motivationMessage} onChange={handleSetupChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 resize-none"></textarea>
                </div>
            </div>

            <div className="flex gap-4">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/3 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSettingUp}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-slate-950 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSettingUp ? <Loader2 className="animate-spin" /> : (isEditing ? "Save Changes" : "Start Tracking")}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-2">
            <Target className="text-emerald-400" /> Recovery Tracker
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your progress, overcome cravings, and stay motivated.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all"
          >
            <Settings size={18} /> Settings
          </button>
          <button 
            onClick={() => setShowCheckIn(!showCheckIn)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all"
          >
            {showCheckIn ? <><ChevronUp size={18} /> Close Check-In</> : <><Plus size={18} /> Log Check-In</>}
          </button>
        </div>
      </div>

      {/* Check-In Form Collapse */}
      {showCheckIn && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <DailyCheckInForm onCheckInSuccess={(updatedTracker) => {
            setTrackerData(updatedTracker);
            setShowCheckIn(false);
          }} />
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <TrackerStatCard 
          title="Smoke-Free Streak" 
          value={trackerData.currentSmokingStreak || 0} 
          suffix="days"
          icon={<Activity size={20} />}
          colorClass="text-emerald-400"
          subtitle={`Best: ${trackerData.bestSmokingStreak || 0} days`}
        />
        <TrackerStatCard 
          title="Alcohol-Free Streak" 
          value={trackerData.currentAlcoholStreak || 0} 
          suffix="days"
          icon={<Activity size={20} />}
          colorClass="text-cyan-400"
          subtitle={`Best: ${trackerData.bestAlcoholStreak || 0} days`}
        />
        <TrackerStatCard 
          title="Habit Journey Progress" 
          value={trackerData.habitJourneyProgress || 0} 
          suffix="%"
          icon={<Target size={20} />}
          colorClass="text-purple-400"
          subtitle="One-year journey metric"
        />
        
        <TrackerStatCard 
          title="Cigarettes Avoided" 
          value={trackerData.cigarettesAvoided || 0} 
          icon={<FileText size={20} />}
          colorClass="text-amber-400"
          subtitle={`Saved ${trackerData.currency || "$"}${(trackerData.moneySavedCigarettes || 0).toFixed(2)}`}
        />
        <TrackerStatCard 
          title="Drinks Avoided" 
          value={trackerData.drinksAvoided || 0} 
          icon={<FileText size={20} />}
          colorClass="text-orange-400"
          subtitle={`Saved ${trackerData.currency || "$"}${(trackerData.moneySavedAlcohol || 0).toFixed(2)}`}
        />
        <TrackerStatCard 
          title="Total Money Saved" 
          value={`${trackerData.currency || "$"}${((trackerData.moneySavedCigarettes || 0) + (trackerData.moneySavedAlcohol || 0)).toFixed(2)}`} 
          icon={<Sparkles size={20} />}
          colorClass="text-yellow-400"
          borderClass="border-yellow-500/20"
          subtitle="Keep it up!"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <ProgressChart checkIns={trackerData.checkIns} />
        </div>

        {/* Motivation & Milestones Section */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" /> Daily Motivation
            </h3>
            <blockquote className="border-l-4 border-amber-500/50 pl-4 py-1 mb-4 italic text-slate-300 text-sm">
              "{trackerData.dailyMotivationalQuote}"
            </blockquote>
            {trackerData.motivationMessage && (
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-sm">
                <span className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Your Reason</span>
                <span className="text-sky-300 font-medium">{trackerData.motivationMessage}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Target size={18} className="text-cyan-400" /> Milestones
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allMilestones.map((m) => (
                <MilestoneBadge 
                  key={m} 
                  milestone={m} 
                  isEarned={trackerData.milestones?.includes(m)} 
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Disclaimer */}
      <div className="text-center pb-8 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">
          Recovery information shown here is educational and based on tracked habits. It is not a medical measurement or diagnosis.
        </p>
      </div>

    </motion.div>
  );
}

export default Tracker;
