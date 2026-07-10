import { useState } from "react";
import { Eye, EyeOff, FileImage, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ScanComparisonPanel({ title, scanData }) {
  // Default to heatmap if available, else original
  const [activeTab, setActiveTab] = useState(scanData?.heatmapImage ? "heatmap" : "original");

  const getPredictionColor = (pred) => {
    if (pred === "Normal") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (pred === "Pneumonia") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const resolveImageSource = (img) => {
    if (!img || typeof img !== "string" || img.trim() === "") return null;
    
    if (
      img.startsWith("data:") ||
      img.startsWith("http://") ||
      img.startsWith("https://") ||
      img.startsWith("blob:")
    ) {
      return img;
    }
    
    if (img.includes(".")) {
      return img.startsWith("/") ? img : `/${img}`;
    }
    
    return `data:image/png;base64,${img}`;
  };

  const originalSrc = resolveImageSource(scanData?.originalImage);
  const heatmapSrc = resolveImageSource(scanData?.heatmapImage);

  // Auto-select available tab if one is missing
  if (activeTab === "heatmap" && !heatmapSrc && originalSrc) {
    setActiveTab("original");
  } else if (activeTab === "original" && !originalSrc && heatmapSrc) {
    setActiveTab("heatmap");
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-slate-200 flex items-center gap-2">
          {title}
        </h3>
        <span className="text-xs font-semibold text-slate-400">
          {formatDateTime(scanData?.scanDate)}
        </span>
      </div>

      <div className="p-5 flex-grow flex flex-col gap-6">
        
        {/* Image Viewer */}
        <div className="relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="flex bg-slate-900/80 border-b border-slate-800 p-2 gap-2 justify-center">
            <button
              onClick={() => setActiveTab("original")}
              disabled={!originalSrc}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === "original" 
                  ? "bg-sky-500 text-slate-950" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800"
              }`}
            >
              <Eye size={14} />
              Original
            </button>
            <button
              onClick={() => setActiveTab("heatmap")}
              disabled={!heatmapSrc}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === "heatmap" 
                  ? "bg-sky-500 text-slate-950" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800"
              }`}
            >
              <EyeOff size={14} />
              AI Attention Map
            </button>
          </div>

          <div className="flex-grow flex items-center justify-center p-2 min-h-[250px]">
             <AnimatePresence mode="wait">
                {activeTab === "heatmap" ? (
                  heatmapSrc ? (
                    <motion.img
                      key="heatmap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={heatmapSrc}
                      alt="Grad-CAM Heatmap"
                      className="max-h-[250px] w-auto object-contain rounded"
                    />
                  ) : (
                    <motion.div
                      key="heatmap-fallback"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-slate-500 h-full py-8"
                    >
                      <FileImage size={32} className="mb-2 opacity-30" />
                      <span className="text-xs font-semibold">AI attention map was not generated for this report.</span>
                    </motion.div>
                  )
                ) : (
                  originalSrc ? (
                    <motion.img
                      key="original"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      src={originalSrc}
                      alt="Original Scan"
                      className="max-h-[250px] w-auto object-contain rounded"
                    />
                  ) : (
                    <motion.div
                      key="original-fallback"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-slate-500 h-full py-8 text-center px-4"
                    >
                      <FileImage size={32} className="mb-2 opacity-30" />
                      <span className="text-xs font-semibold">Original image was not stored for this older report.</span>
                    </motion.div>
                  )
                )}
             </AnimatePresence>
          </div>
        </div>

        {/* Prediction Data */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Prediction</span>
              <span className={`inline-flex items-center px-2 py-1 border text-xs font-bold rounded-lg ${getPredictionColor(scanData?.prediction)}`}>
                {scanData?.prediction || "Unknown"}
              </span>
           </div>
           <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Confidence</span>
              <span className="text-lg font-black text-slate-200">{scanData?.confidence || 0}%</span>
           </div>
        </div>

        {/* Report Summary */}
        <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800 flex-grow">
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Report Summary</span>
           <p className="text-slate-300 text-xs leading-relaxed">
             {scanData?.reportSummary || "No clinical summary available for this report."}
           </p>
        </div>

      </div>
    </div>
  );
}

export default ScanComparisonPanel;
