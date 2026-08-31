import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { UploadCloud, FileAudio, Play, Type, Sparkles, Activity, Plus, Mic, Square, GraduationCap, PenTool, CheckCircle, Award } from "lucide-react";
import { analyzeAudioStream } from "../api/analyze";
import { getRecommendedTask, completeTask } from "../api/tasks";
import AnalysisResultView from "../components/analysis/AnalysisResultView";
import ErrorBoundary from "../components/ErrorBoundary";
import { useAnalysisStore } from "../store/useAnalysisStore";
import { useParams, useNavigate } from "react-router-dom";
import { webmBlobToWavFile } from "../utils/audio";

export default function Analyze() {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const { currentAnalysis, isLoading: storeLoading, fetchAnalysis, fetchLatestAnalysis, clearAnalysis, setCurrentAnalysis } = useAnalysisStore();

  const [analysisMode, setAnalysisMode] = useState<"guided" | "custom">("guided");
  const [recommendedTask, setRecommendedTask] = useState<any>(null);

  const [file, setFile] = useState<File | null>(null);
  const [targetText, setTargetText] = useState("");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ step: "", percent: 0 });
  const [error, setError] = useState("");

  // Recording state
  const [inputMode, setInputMode] = useState<"upload" | "record">("upload");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Task Completion state
  const [taskResult, setTaskResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    async function init() {
      try {
        const task = await getRecommendedTask();
        setRecommendedTask(task);
        if (analysisMode === "guided") {
          setTargetText(task.target_sentence);
        }
      } catch (err) {
        console.error("Failed to fetch task", err);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (analysisId) {
      fetchAnalysis(analysisId);
    } else {
      fetchLatestAnalysis().catch(() => { });
    }
  }, [analysisId]);

  const toggleMode = (mode: "guided" | "custom") => {
    setAnalysisMode(mode);
    if (mode === "guided" && recommendedTask) {
      setTargetText(recommendedTask.target_sentence);
    } else {
      setTargetText("");
    }
  };

  const handleNewAnalysis = () => {
    clearAnalysis();
    setFile(null);
    setError("");
    setTaskResult(null);
    setInputMode("upload");
    if (isRecording) stopRecording();
    navigate("/analyze");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        try {
          const wavFile = await webmBlobToWavFile(blob, "recording.wav");
          setFile(wavFile);
        } catch (err) {
          console.error("Audio conversion failed:", err);
          setError("Failed to process recording.");
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setFile(null);
      setError("");

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      setError("");
      setProgress({ step: "Starting...", percent: 0 });

      const data = await analyzeAudioStream(file, targetText, (step, percent) => {
        setProgress({ step, percent });
      });

      setCurrentAnalysis(data);

      if (analysisMode === "guided" && recommendedTask) {
        try {
          const completion = await completeTask(recommendedTask.id, data.id);
          setTaskResult(completion);
        } catch (err) {
          console.error("Failed to complete task", err);
        }
      }

      if (data.id) {
        navigate(`/analyze/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Gagal menganalisis audio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Speech Analysis</h1>
          <p className="text-slate-500 text-sm">Analyze your Indonesian pronunciation and compare it with native speaker references.</p>
        </div>
        <button
          onClick={handleNewAnalysis}
          className="px-4 py-2 bg-white text-slate-700 font-medium rounded-lg transition-colors border border-slate-200 hover:bg-slate-50 flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> New Analysis
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-max mb-8 border border-slate-200">
        <button
          onClick={() => toggleMode("guided")}
          className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all font-medium text-sm ${analysisMode === "guided" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <GraduationCap size={16} /> Guided Practice
        </button>
        <button
          onClick={() => toggleMode("custom")}
          className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all font-medium text-sm ${analysisMode === "custom" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <PenTool size={16} /> Custom Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="xl:col-span-1 space-y-6">

          {analysisMode === "guided" ? (
            recommendedTask ? (
              <div className="bg-white rounded-xl p-6 border border-emerald-200 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10"></div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles size={18} className="text-emerald-500" /> Today's Task
                  </h3>
                  <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded border border-emerald-100 font-medium">{recommendedTask.level}</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Learning Objective</p>
                    <p className="text-slate-700 text-sm">{recommendedTask.learning_objective}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Focus Area</p>
                    <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-medium border border-blue-100">
                      {recommendedTask.focus_area}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-2 font-semibold">Target Sentence</p>
                  <p className="text-slate-900 text-lg font-medium">"{recommendedTask.target_sentence}"</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 border border-slate-200 text-center text-slate-500 shadow-sm">
                Loading recommended task...
              </div>
            )
          ) : (
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Type size={18} className="text-blue-500" />
                Custom Target Text
              </h3>
              <textarea
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-32 text-sm"
                placeholder="Enter any sentence you want to practice..."
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
              />
            </div>
          )}

          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileAudio size={18} className="text-blue-500" />
                Audio Input
              </h3>
              <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button
                  onClick={() => setInputMode("upload")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${inputMode === "upload" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setInputMode("record")}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${inputMode === "record" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Record
                </button>
              </div>
            </div>

            {inputMode === "upload" ? (
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-all group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" accept="audio/wav" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-all">
                  <UploadCloud size={24} className="text-slate-400 group-hover:text-blue-500" />
                </div>
                <p className="text-slate-600 text-sm">{file ? file.name : "Click to select .wav file"}</p>
              </div>
            ) : (
              <div className="border border-slate-200 bg-slate-50 rounded-lg flex flex-col items-center justify-center p-8 text-center">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-14 h-14 bg-white text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-all border border-red-200 shadow-sm mb-4"
                  >
                    <Mic size={24} />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center transition-all animate-pulse shadow-md mb-4"
                  >
                    <Square size={20} fill="currentColor" />
                  </button>
                )}

                {isRecording ? (
                  <p className="text-red-500 font-mono text-lg">{formatTime(recordingTime)}</p>
                ) : file ? (
                  <p className="text-emerald-600 text-sm flex items-center gap-2"><Sparkles size={16} /> Recording Ready ({file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : (file.size / 1024).toFixed(1) + ' KB'})</p>
                ) : (
                  <p className="text-slate-500 text-sm">Click the microphone to start recording</p>
                )}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading || isRecording || !targetText}
              className="mt-6 w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><Play size={16} /> Analyze Speech</>
              )}
            </button>

            {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
          </div>
        </div>

        {/* Results Section */}
        <div className="xl:col-span-2 relative">

          {/* Task Completion Overlay */}
          {taskResult && (
            <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm rounded-3xl flex items-center justify-center p-8 animate-in fade-in duration-300">
              <div className="bg-slate-800 border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full"></div>

                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                  <CheckCircle size={40} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Task Completed!</h2>

                <div className="flex justify-center gap-4 mb-6">
                  <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 min-w-[100px]">
                    <p className="text-slate-400 text-xs mb-1">XP Earned</p>
                    <p className="text-emerald-400 text-xl font-bold">+{taskResult.xp_earned}</p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 min-w-[100px]">
                    <p className="text-slate-400 text-xs mb-1">Pronunciation</p>
                    <p className="text-blue-400 text-xl font-bold">{Math.round(taskResult.score)}</p>
                  </div>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-4 mb-6 border border-blue-500/20 text-left">
                  <p className="text-blue-300 text-sm italic">"{taskResult.coach_feedback}"</p>
                </div>

                {taskResult.achievements_unlocked && taskResult.achievements_unlocked.length > 0 && (
                  <div className="mb-6 flex justify-center gap-2">
                    {taskResult.achievements_unlocked.map((ach: string) => (
                      <div key={ach} className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 border border-amber-500/30">
                        <Award size={14} /> Achievement Unlocked
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setTaskResult(null)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
                >
                  View Detailed Analysis
                </button>
              </div>
            </div>
          )}

          {loading || storeLoading ? (
            <div className="bg-white rounded-xl p-12 border border-slate-200 flex flex-col items-center justify-center h-full min-h-[400px] shadow-sm">
              <div className="w-full max-w-md">
                <div className="flex justify-between text-slate-500 text-sm mb-2 font-medium">
                  <span className="flex items-center gap-2"><Activity size={16} className="animate-pulse text-blue-500" /> {loading ? progress.step : "Loading workspace..."}</span>
                  <span>{loading ? progress.percent : 100}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${loading ? progress.percent : 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : currentAnalysis ? (
            <ErrorBoundary>
              <AnalysisResultView data={currentAnalysis} />
            </ErrorBoundary>
          ) : (
            <div className="bg-white rounded-xl p-12 border border-slate-200 flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400 shadow-sm">
              <Sparkles size={32} className="mb-3 opacity-20 text-slate-500" />
              <p className="text-sm">Results will appear here after analysis.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}