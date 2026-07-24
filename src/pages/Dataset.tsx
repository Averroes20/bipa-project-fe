import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { rebuildAnalytics, rebuildDataset } from "../api/analytics";
import { Database, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

export default function Dataset() {
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleRebuildDataset = async () => {
    try {
      setLoadingDataset(true);
      setMessage(null);
      await rebuildDataset();
      setMessage({ type: 'success', text: 'Dataset reference rebuilt successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to rebuild dataset.' });
    } finally {
      setLoadingDataset(false);
    }
  };

  const handleRebuildAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      setMessage(null);
      await rebuildAnalytics();
      setMessage({ type: 'success', text: 'Global analytics rebuilt successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to rebuild global analytics.' });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Database className="text-blue-500" /> Dataset Management
        </h1>
        <p className="text-slate-400">Manage audio dataset references and trigger system-wide analytics rebuilds.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dataset Rebuild */}
        <div className="glass rounded-3xl p-8 border border-slate-700/50">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                    <Database size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Native Dataset</h3>
                    <p className="text-sm text-slate-400">Update reference baseline</p>
                </div>
            </div>
            
            <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                Rebuilding the dataset reference will re-scan the native speakers' audio directory and recalculate the baseline features (pitch, energy, pause ratio) used for DTW comparisons.
            </p>

            <button
                onClick={handleRebuildDataset}
                disabled={loadingDataset || loadingAnalytics}
                className="w-full py-3.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-all border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
                {loadingDataset ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <RefreshCw size={18} /> Rebuild Dataset
                    </>
                )}
            </button>
        </div>

        {/* Analytics Rebuild */}
        <div className="glass rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden group">
            {/* Warning glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Global Analytics</h3>
                    <p className="text-sm text-slate-400">Recalculate global statistics</p>
                </div>
            </div>
            
            <p className="text-slate-300 text-sm mb-8 leading-relaxed relative z-10">
                Triggering a global analytics rebuild will clear current statistics and re-aggregate data from all historical user analyses. This action might take a few moments depending on database size.
            </p>

            <button
                onClick={handleRebuildAnalytics}
                disabled={loadingAnalytics || loadingDataset}
                className="w-full py-3.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10"
            >
                {loadingAnalytics ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <RefreshCw size={18} /> Rebuild Analytics
                    </>
                )}
            </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
