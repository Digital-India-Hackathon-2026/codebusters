import { useState, useEffect } from "react";
import API from "../services/api";
import { Upload, FileImage, ShieldAlert, Sparkles, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function XrayUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await API.get("/xray/history");
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        setError("");
      } else {
        setError("Only image files (JPEG, PNG) are supported.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await API.post("/xray/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(res.data);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError("Failed to analyze X-ray scan. Please ensure the AI service is online.");
    } finally {
      setLoading(false);
    }
  };

  const getPredictionColor = (pred) => {
    if (pred === "Normal") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (pred === "Pneumonia") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="relative max-w-5xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
          <FileImage size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-100">Chest X-ray Analyzer</h1>
          <p className="text-slate-400 text-sm mt-1">Upload chest scans to diagnose abnormalities using PyTorch ResNet18 transfer learning models.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-950/40 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid md:grid-cols-5 gap-8 items-stretch">
        {/* Upload card */}
        <div className="md:col-span-3 bg-slate-900/40 backdrop-blur-md border border-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between min-h-[350px]">
          <form onSubmit={handleUpload} className="flex flex-col gap-5 h-full justify-between">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3">Scan Upload</h2>
            
            {/* Drag & drop zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] transition-all cursor-pointer ${
                dragActive ? "border-sky-500 bg-sky-500/5" : "border-slate-800 bg-slate-950/30 hover:border-slate-700"
              }`}
            >
              {previewUrl ? (
                <div className="relative group max-h-[200px] rounded-lg overflow-hidden">
                  <img src={previewUrl} alt="Preview" className="max-h-[200px] object-contain rounded-lg shadow-md" />
                  {/* Scanner line during loading */}
                  {loading && (
                    <motion.div 
                      initial={{ top: 0 }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-cyan-400 opacity-90 shadow-md shadow-sky-500/50"
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-slate-950 rounded-full border border-slate-850 text-slate-500">
                    <Upload size={24} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-300">Drag & drop scan here, or </span>
                    <label className="text-sm font-bold text-sky-400 hover:underline cursor-pointer">
                      browse files
                      <input 
                        type="file" 
                        required
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">Supports JPEG, PNG up to 10MB</p>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="flex gap-4 items-center justify-between bg-slate-950/60 p-3.5 border border-slate-850 rounded-xl mt-3">
                <span className="text-xs font-semibold text-slate-400 truncate max-w-[200px]">{selectedFile.name}</span>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => { setSelectedFile(null); setPreviewUrl(""); setResult(null); }}
                    className="text-xs text-slate-450 hover:text-slate-300 font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-955 hover:opacity-95 disabled:opacity-50 text-xs font-black rounded-lg cursor-pointer"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : "Run AI Scan"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results Panel */}
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Classification</span>
                  <div className={`mt-3 py-2 px-4 border rounded-full font-bold inline-flex items-center gap-1.5 text-sm ${getPredictionColor(result.prediction)}`}>
                    <CheckCircle size={16} /> {result.prediction}
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Confidence bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-350">Confidence Score</span>
                    <span className="font-bold text-slate-200">{result.confidence}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Analysis Message */}
                <div className="bg-slate-950/60 border border-slate-850 p-4.5 rounded-xl flex-grow flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-sky-400" /> Clinical Review
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.message}</p>
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
                  <FileImage size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-300 mb-1">Awaiting Scan</h3>
                <p className="text-xs text-slate-455 max-w-[200px] mx-auto leading-relaxed">
                  Provide a chest X-ray image scan to evaluate using transfer learning classifiers.
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
            <CheckCircle size={18} className="text-sky-400" /> Uploaded Scans Log
          </h3>
          <button 
            onClick={fetchHistory}
            className="p-1.5 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={16} className={historyLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {historyLoading && history.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">Loading logs...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl text-slate-505 text-sm">
            No X-ray reports saved. Perform your first scan to populate this directory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-350">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 pt-1">Timestamp</th>
                  <th className="pb-3 pt-1">File Name</th>
                  <th className="pb-3 pt-1">File Type</th>
                  <th className="pb-3 pt-1">AI Classification</th>
                  <th className="pb-3 pt-1">Confidence Score</th>
                  <th className="pb-3 pt-1">Clinical Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3.5 whitespace-nowrap">{new Date(row.uploadedAt).toLocaleString()}</td>
                    <td className="py-3.5 truncate max-w-[150px]">{row.fileName}</td>
                    <td className="py-3.5">{row.fileType}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 border text-xs font-bold rounded-lg ${getPredictionColor(row.prediction)}`}>
                        {row.prediction}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-200">{row.confidence}%</td>
                    <td className="py-3.5 text-xs text-slate-400 max-w-[200px] truncate" title={row.message}>{row.message}</td>
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

export default XrayUpload;