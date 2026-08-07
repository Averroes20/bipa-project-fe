import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getDatasets, getDatasetDetail, uploadDataset, startRebuild, getRebuildStatus, deleteDataset } from "../api/dataset";
import { Database, RefreshCw, AlertTriangle, CheckCircle, Upload, Trash2, X, Activity, BarChart2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";

export default function Dataset() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const debounceTimer = useRef<any>(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  
  const [rebuildStatus, setRebuildStatus] = useState<any>({ status: "idle", progress: 0 });
  const [pollingRebuild, setPollingRebuild] = useState(false);
  const rebuildTimer = useRef<any>(null);

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadGender, setUploadGender] = useState("male");
  const [uploading, setUploading] = useState(false);

  // Detail state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, [page, search, genderFilter]);

  useEffect(() => {
    let interval: any;
    if (pollingRebuild) {
      interval = setInterval(async () => {
        try {
          const res = await getRebuildStatus();
          setRebuildStatus(res);
          if (res.status === "completed" || res.status === "error") {
            setPollingRebuild(false);
            if (res.status === "completed") {
              setMessage({ type: 'success', text: 'Dataset reference rebuilt successfully!' });
              fetchDatasets();
            } else {
              setMessage({ type: 'error', text: 'Failed to rebuild dataset.' });
            }
          }
        } catch (e) {
          setPollingRebuild(false);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [pollingRebuild]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await getDatasets(page, 10, search, genderFilter);
      setDatasets(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    try {
      setUploading(true);
      await uploadDataset(uploadFile, uploadGender);
      setMessage({ type: 'success', text: 'File uploaded successfully!' });
      setUploadOpen(false);
      setUploadFile(null);
      fetchDatasets();
    } catch (e) {
      setMessage({ type: 'error', text: 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this dataset?")) return;
    try {
      await deleteDataset(id);
      setMessage({ type: 'success', text: 'Dataset deleted!' });
      fetchDatasets();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to delete dataset.' });
    }
  };

  const handleRebuild = async () => {
    try {
      await startRebuild();
      setRebuildStatus({ status: "running", progress: 0 });
      setPollingRebuild(true);
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to start rebuild.' });
    }
  };

  const openDetail = async (item: any) => {
    setSelectedDataset(item);
    setDetailOpen(true);
    setLoadingDetail(true);
    try {
      const res = await getDatasetDetail(item.id);
      setDetailData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatContourData = (contour: number[]) => {
    return contour?.map((val, idx) => ({ time: idx, pitch: val > 0 ? val : null })) || [];
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Database className="text-blue-500" /> Corpus Dataset
          </h1>
          <p className="text-slate-400">Manage and explore native speaker reference files.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRebuild}
            disabled={pollingRebuild}
            className="px-4 py-2 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-all border border-slate-600 disabled:opacity-50 flex items-center gap-2"
          >
            {pollingRebuild ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Rebuild Corpus
          </button>
          <button
            onClick={() => setUploadOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            <Upload size={18} /> Add File
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <p className="font-medium">{message.text}</p>
        </div>
      )}

      {pollingRebuild && (
        <div className="mb-8 glass rounded-2xl p-6 border border-blue-500/30">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Rebuilding Dataset... {rebuildStatus.current_file ? `(${rebuildStatus.current_file})` : ''}</span>
            <span>{rebuildStatus.progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${rebuildStatus.progress}%` }}></div>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl p-6 border border-slate-700/50 mb-8">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search filename..."
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl">Filename</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Duration (s)</th>
                <th className="px-4 py-3">Pitch Mean</th>
                <th className="px-4 py-3">Energy Mean</th>
                <th className="px-4 py-3 text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">Loading...</td>
                </tr>
              ) : datasets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">No datasets found.</td>
                </tr>
              ) : (
                datasets.map(d => (
                  <tr key={d.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{d.filename}</td>
                    <td className="px-4 py-3 capitalize">{d.gender}</td>
                    <td className="px-4 py-3">{d.duration?.toFixed(2)}</td>
                    <td className="px-4 py-3">{d.pitch_mean?.toFixed(1) || '-'}</td>
                    <td className="px-4 py-3">{d.energy_mean?.toFixed(4) || '-'}</td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button onClick={() => openDetail(d)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                        <BarChart2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-slate-400">Showing {datasets.length} of {total}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 bg-slate-800 rounded-lg disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={datasets.length < 10}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-slate-800 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog.Root open={uploadOpen} onOpenChange={setUploadOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 p-6 rounded-2xl w-full max-w-md z-50 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-bold text-white">Upload Native Audio</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-white"><X size={20} /></button>
              </Dialog.Close>
            </div>
            
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  value={uploadGender}
                  onChange={(e) => setUploadGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Audio File (.wav)</label>
                <input 
                  type="file" 
                  accept="audio/wav"
                  className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600">Cancel</button>
                </Dialog.Close>
                <button type="submit" disabled={uploading || !uploadFile} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Detail Dialog */}
      <Dialog.Root open={detailOpen} onOpenChange={setDetailOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 p-8 rounded-3xl w-full max-w-4xl z-50 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Dialog.Title className="text-2xl font-bold text-white flex items-center gap-2">
                  <Activity className="text-blue-500" /> Analysis Details
                </Dialog.Title>
                <Dialog.Description className="text-slate-400 mt-1">
                  {selectedDataset?.filename} ({selectedDataset?.gender})
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className="text-slate-400 hover:text-white bg-slate-700/50 p-2 rounded-full"><X size={20} /></button>
              </Dialog.Close>
            </div>
            
            {loadingDetail ? (
              <div className="py-20 text-center text-slate-400">Loading analysis data...</div>
            ) : detailData ? (
              <div className="grid grid-cols-1 gap-6">
                
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">Duration</div>
                    <div className="text-xl text-white font-bold">{detailData.audio?.duration?.toFixed(2)}s</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">Pitch Mean</div>
                    <div className="text-xl text-white font-bold">{detailData.feature?.pitch_mean?.toFixed(1)} Hz</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">Speech Rate</div>
                    <div className="text-xl text-white font-bold">{detailData.feature?.speech_rate?.toFixed(1)} wps</div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">Clarity (ZCR)</div>
                    <div className="text-xl text-white font-bold">{detailData.feature?.zcr?.toFixed(3)}</div>
                  </div>
                </div>

                {/* F0 Contour */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">F0 Pitch Contour</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatContourData(detailData.contour?.pitch_contour)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Line type="monotone" dataKey="pitch" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Formant Space (F1/F2) */}
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">Formant Space (F1 vs F2)</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        {/* F2 is typically on the X axis, reversed, but standard Recharts doesn't reverse easily without custom ticks. We'll just plot normally. */}
                        <XAxis dataKey="F2" name="F2 (Hz)" type="number" stroke="#94a3b8" domain={['auto', 'auto']} />
                        <YAxis dataKey="F1" name="F1 (Hz)" type="number" stroke="#94a3b8" domain={['auto', 'auto']} />
                        <ZAxis dataKey="vowel" type="category" name="Vowel" />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Scatter name="Vowels" data={detailData.formant?.vowel_space || []} fill="#8b5cf6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-slate-400">Failed to load data.</div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </DashboardLayout>
  );
}
