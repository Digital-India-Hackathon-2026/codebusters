import { Download, Loader2, ArrowRightLeft, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { motion } from "framer-motion";

function ComparisonSummary({ comparisonData, handleDownloadPdf, pdfLoading }) {
  const { comparison, comparisonSummary, disclaimer } = comparisonData;

  const getDirectionIcon = (direction) => {
    if (direction === "INCREASED") return <TrendingUp size={20} className="text-rose-400" />;
    if (direction === "DECREASED") return <TrendingDown size={20} className="text-emerald-400" />;
    return <Minus size={20} className="text-slate-400" />;
  };

  const getDirectionColor = (direction) => {
    if (direction === "INCREASED") return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    if (direction === "DECREASED") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    return "text-slate-400 bg-slate-800/50 border-slate-700";
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Prediction Change */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl text-center flex flex-col justify-center items-center">
           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">AI Prediction</span>
           <div className="flex items-center gap-3 text-sm font-bold text-slate-200">
              <span className="bg-slate-800 px-3 py-1.5 rounded-lg">{comparisonData.olderScan.prediction}</span>
              <ArrowRightLeft size={16} className="text-slate-500" />
              <span className="bg-slate-800 px-3 py-1.5 rounded-lg">{comparisonData.newerScan.prediction}</span>
           </div>
        </div>

        {/* Confidence Difference */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl text-center flex flex-col justify-center items-center">
           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Confidence Shift</span>
           <div className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-bold ${getDirectionColor(comparison.confidenceDirection)}`}>
              {getDirectionIcon(comparison.confidenceDirection)}
              <span className="text-lg">
                {comparison.confidenceDifference > 0 ? "+" : ""}{comparison.confidenceDifference} pts
              </span>
           </div>
        </div>

        {/* Days Between */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl text-center flex flex-col justify-center items-center">
           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Between Scans</span>
           <span className="text-3xl font-black text-sky-400">{comparison.daysBetweenScans}</span>
           <span className="text-xs text-slate-400 mt-1 font-semibold uppercase">Days</span>
        </div>

      </div>

      {/* Safe Summary & Disclaimer */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
         <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Info className="text-sky-400" size={18} /> Comparison Summary
         </h4>
         <p className="text-slate-300 text-sm leading-relaxed mb-6">
           {comparisonSummary}
         </p>

         <h4 className="font-bold text-slate-200 mb-4 mt-8 flex items-center gap-2">
            <Info className="text-sky-400" size={18} /> Key Comparison Points
         </h4>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">AI Prediction</span>
              <span className="text-sm text-slate-200 font-bold flex items-center gap-2">
                {comparisonData.olderScan.prediction.toUpperCase()} <ArrowRightLeft size={14} className="text-slate-500" /> {comparisonData.newerScan.prediction.toUpperCase()}
              </span>
            </div>
            
            <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">AI Confidence</span>
              <span className="text-sm text-slate-200 font-bold flex items-center gap-2">
                {comparisonData.olderScan.confidence}% <ArrowRightLeft size={14} className="text-slate-500" /> {comparisonData.newerScan.confidence}%
              </span>
            </div>
            
            <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Confidence Shift</span>
              <span className="text-sm text-slate-200 font-bold">
                {comparison.confidenceDirection === "INCREASED" && `Increased by ${comparison.confidenceDifference} percentage points`}
                {comparison.confidenceDirection === "DECREASED" && `Decreased by ${Math.abs(comparison.confidenceDifference)} percentage points`}
                {comparison.confidenceDirection === "NO_CHANGE" && `No change in AI confidence`}
              </span>
            </div>

            <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Time Between Scans</span>
              <span className="text-sm text-slate-200 font-bold">
                {comparison.daysBetweenScans === 0 ? "0 days (These scans were analyzed on the same day)" : `${comparison.daysBetweenScans} days`}
              </span>
            </div>

            <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Image Availability</span>
              <div className="text-xs text-slate-300 font-semibold space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${comparisonData.olderScan.originalImage ? "bg-emerald-400" : "bg-rose-400"}`}></div>
                  {comparisonData.olderScan.originalImage ? "Older original image available" : "Older original image unavailable"}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${comparisonData.newerScan.heatmapImage ? "bg-emerald-400" : "bg-rose-400"}`}></div>
                  {comparisonData.newerScan.heatmapImage ? "Newer attention map available" : "Newer attention map unavailable"}
                </div>
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Clinical Guidance</span>
              <span className="text-sm text-amber-400/90 font-bold">
                A qualified healthcare professional should review both scans.
              </span>
            </div>
         </div>
         
         <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl mb-6">
           <p className="text-xs text-amber-500/80 leading-relaxed italic text-justify">
             {disclaimer}
           </p>
         </div>

         <div className="flex justify-end">
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {pdfLoading ? "Generating PDF..." : "Download Comparison PDF"}
            </button>
         </div>
      </div>
    </div>
  );
}

export default ComparisonSummary;
