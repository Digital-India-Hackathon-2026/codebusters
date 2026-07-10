import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import API from "../services/api";

function DailyCheckInForm({ onCheckInSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    checkInDate: new Date().toISOString().split("T")[0],
    didSmoke: false,
    cigarettesSmoked: 0,
    didDrink: false,
    drinksConsumed: 0,
    cravingLevel: 1,
    mood: "Good",
    notes: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        cigarettesSmoked: formData.didSmoke ? parseInt(formData.cigarettesSmoked) || 0 : 0,
        drinksConsumed: formData.didDrink ? parseInt(formData.drinksConsumed) || 0 : 0,
        cravingLevel: parseInt(formData.cravingLevel) || 1
      };

      const res = await API.post("/tracker/check-in", payload);
      onCheckInSuccess(res.data);
      // Reset form but keep the date
      setFormData(prev => ({
        ...prev,
        didSmoke: false,
        cigarettesSmoked: 0,
        didDrink: false,
        drinksConsumed: 0,
        cravingLevel: 1,
        mood: "Good",
        notes: ""
      }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Check className="text-sky-400" /> Daily Check-In
      </h3>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Date</label>
            <input
              type="date"
              name="checkInDate"
              value={formData.checkInDate}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Mood</label>
            <select
              name="mood"
              value={formData.mood}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            >
              <option value="Great">Great</option>
              <option value="Good">Good</option>
              <option value="Okay">Okay</option>
              <option value="Struggling">Struggling</option>
              <option value="Bad">Bad</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Smoking Section */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="didSmoke"
                checked={formData.didSmoke}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
              />
              <span className="font-semibold text-slate-300">Did you smoke today?</span>
            </label>
            
            {formData.didSmoke && (
              <div className="pl-8">
                <label className="text-sm text-slate-400 block mb-2">How many cigarettes?</label>
                <input
                  type="number"
                  name="cigarettesSmoked"
                  min="1"
                  value={formData.cigarettesSmoked}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>
            )}
          </div>

          {/* Alcohol Section */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="didDrink"
                checked={formData.didDrink}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
              />
              <span className="font-semibold text-slate-300">Did you drink alcohol today?</span>
            </label>
            
            {formData.didDrink && (
              <div className="pl-8">
                <label className="text-sm text-slate-400 block mb-2">How many drinks?</label>
                <input
                  type="number"
                  name="drinksConsumed"
                  min="1"
                  value={formData.drinksConsumed}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex justify-between text-sm font-semibold text-slate-300">
            <span>Craving Level</span>
            <span className="text-sky-400 font-bold">{formData.cravingLevel}/10</span>
          </label>
          <input
            type="range"
            name="cravingLevel"
            min="1"
            max="10"
            value={formData.cravingLevel}
            onChange={handleChange}
            className="w-full accent-sky-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>None</span>
            <span>Intense</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="How are you feeling? Any triggers today?"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 text-slate-950 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={20} /> Saving Check-In...</>
          ) : (
            <><Check size={20} /> Save Check-In</>
          )}
        </button>
      </form>
    </div>
  );
}

export default DailyCheckInForm;
