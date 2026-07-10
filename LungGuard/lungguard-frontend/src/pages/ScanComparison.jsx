import { useState, useEffect } from "react";
import { GitCompare, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import ScanSelector from "../components/comparison/ScanSelector";
import ScanComparisonPanel from "../components/comparison/ScanComparisonPanel";
import ComparisonSummary from "../components/comparison/ComparisonSummary";

function ScanComparison() {
  const [scanType, setScanType] = useState("XRAY");
  const [availableScans, setAvailableScans] = useState([]);
  const [olderReportId, setOlderReportId] = useState("");
  const [newerReportId, setNewerReportId] = useState("");
  
  const [loadingScans, setLoadingScans] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchAvailableScans(scanType);
  }, [scanType]);

  const fetchAvailableScans = async (type) => {
    setLoadingScans(true);
    setError("");
    setComparisonData(null);
    setOlderReportId("");
    setNewerReportId("");
    
    try {
      const res = await API.get("/scan-comparison/reports", {
        params: { type }
      });
      setAvailableScans(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your scan history.");
    } finally {
      setLoadingScans(false);
    }
  };

  const handleCompare = async () => {
    if (!olderReportId || !newerReportId) return;
    
    setComparing(true);
    setError("");
    
    try {
      const res = await API.post("/scan-comparison/compare", {
        olderReportId,
        newerReportId,
        scanType
      });
      setComparisonData(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
         setError("Invalid report selection. Please ensure you select a valid older and newer scan.");
      } else if (err.response?.status === 403) {
         setError("You are not authorized to compare these reports.");
      } else {
         setError("An error occurred while comparing the scans.");
      }
    } finally {
      setComparing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!olderReportId || !newerReportId) return;
    
    setPdfLoading(true);
    
    try {
      const res = await API.post("/scan-comparison/download", {
        olderReportId,
        newerReportId,
        scanType
      }, {
        responseType: "blob"
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Scan_Comparison_${scanType}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download PDF", err);
      setError("Failed to generate and download the comparison PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="relative max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
          <GitCompare size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-100">Scan Comparison</h1>
          <p className="text-slate-400 text-sm mt-1">Compare two saved AI-assisted scan reports.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-950/40 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selection Section */}
      <ScanSelector 
        scanType={scanType}
        setScanType={setScanType}
        availableScans={availableScans}
        olderReportId={olderReportId}
        setOlderReportId={setOlderReportId}
        newerReportId={newerReportId}
        setNewerReportId={setNewerReportId}
        handleCompare={handleCompare}
        loading={comparing || loadingScans}
      />

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {comparisonData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Panels Grid */}
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              <ScanComparisonPanel 
                 title="Previous Scan" 
                 scanData={comparisonData.olderScan} 
              />
              <ScanComparisonPanel 
                 title="Current Scan" 
                 scanData={comparisonData.newerScan} 
              />
            </div>

            {/* Summary & Download */}
            <ComparisonSummary 
              comparisonData={comparisonData} 
              handleDownloadPdf={handleDownloadPdf}
              pdfLoading={pdfLoading}
            />

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default ScanComparison;
