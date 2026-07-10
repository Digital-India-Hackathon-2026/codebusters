import { CheckCircle, Info } from "lucide-react";

function ScanSelector({ scanType, setScanType, availableScans, olderReportId, setOlderReportId, newerReportId, setNewerReportId, handleCompare, loading }) {
  
  const handleOlderChange = (e) => {
    const newId = e.target.value ? Number(e.target.value) : "";
    setOlderReportId(newId);
    if (newId === newerReportId) {
      setNewerReportId("");
    }
  };

  const handleNewerChange = (e) => {
    setNewerReportId(e.target.value ? Number(e.target.value) : "");
  };

  const getFilteredNewerScans = () => {
    if (!olderReportId) return availableScans;
    const olderScanIndex = availableScans.findIndex(s => s.reportId === olderReportId);
    // Since availableScans are ordered by uploadedAt DESC (newest first)
    // The newer scans are the ones with index < olderScanIndex
    return availableScans.slice(0, olderScanIndex);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="grid md:grid-cols-4 gap-6 items-end">
        
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Scan Type</label>
          <select 
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500/50 transition-colors"
          >
            <option value="XRAY">Chest X-ray</option>
            <option value="CT">Lung CT</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Previous Scan</label>
          <select 
            value={olderReportId}
            onChange={handleOlderChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500/50 transition-colors"
          >
            <option value="">Select older scan...</option>
            {availableScans.map(scan => (
              <option key={scan.reportId} value={scan.reportId}>
                {new Date(scan.scanDate).toLocaleDateString()} - {scan.prediction} ({scan.confidence}%)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Scan</label>
          <select 
            value={newerReportId}
            onChange={handleNewerChange}
            disabled={!olderReportId}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500/50 transition-colors disabled:opacity-50"
          >
            <option value="">Select newer scan...</option>
            {getFilteredNewerScans().map(scan => (
              <option key={scan.reportId} value={scan.reportId}>
                {new Date(scan.scanDate).toLocaleDateString()} - {scan.prediction} ({scan.confidence}%)
              </option>
            ))}
          </select>
        </div>

        <div>
          <button 
            onClick={handleCompare}
            disabled={!olderReportId || !newerReportId || loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 text-slate-950 font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Comparing..." : "Compare Scans"}
          </button>
        </div>
      </div>
      
      {availableScans.length < 2 && !loading && (
        <div className="mt-6 flex items-start gap-3 p-4 bg-sky-950/30 border border-sky-500/20 rounded-xl text-sm text-sky-400">
          <Info size={18} className="shrink-0 mt-0.5" />
          <p>At least two saved reports of the same scan type are required for comparison.</p>
        </div>
      )}
    </div>
  );
}

export default ScanSelector;
