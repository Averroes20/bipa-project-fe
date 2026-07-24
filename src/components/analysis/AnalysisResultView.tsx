import { CheckCircle2, AlertTriangle, AlertCircle, Info, ThumbsUp, TrendingUp, Music, Mic, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ScatterChart, Scatter, ZAxis, LabelList } from "recharts";

interface Props {
  data: any;
}

export default function AnalysisResultView({ data }: Props) {
  if (!data) return null;

  // Chart mapping for pitch & energy contours
  const pitchContourData = data.pitch?.contour?.map((val: number, i: number) => ({
    frame: i,
    pitch: val
  })) || [];

  // Formant scatter point
  const formantData = data.phonetics?.vowel_space?.length > 0 
    ? data.phonetics.vowel_space.map((v: any) => ({
        f1: v.f1,
        f2: v.f2,
        name: v.phoneme
      }))
    : [{
        f1: data.phonetics?.formants?.F1 || 0,
        f2: data.phonetics?.formants?.F2 || 0,
        name: 'Your Vowel Space'
      }];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. OVERALL SCORE CARD */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="z-10">
          <p className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-2">Overall Pronunciation Score</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-6xl font-bold text-white">{data.overall_score}</h2>
            <span className="text-2xl text-slate-500">/100</span>
          </div>
          <p className="text-blue-400 mt-2 font-medium">Native Similarity: {data.voice_profile} ({Math.max(data.similarity.male, data.similarity.female)}%)</p>
        </div>

        {/* DIMENSIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto z-10 flex-1 justify-end">
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase mb-1">Pronunciation</p>
            <p className="text-2xl font-bold text-white">{data.dimensions.pronunciation}</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase mb-1">Intonation</p>
            <p className="text-2xl font-bold text-white">{data.dimensions.intonation}</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase mb-1">Fluency</p>
            <p className="text-2xl font-bold text-white">{data.dimensions.fluency}</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase mb-1">Clarity</p>
            <p className="text-2xl font-bold text-white">{data.dimensions.clarity}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2. TIMELINE & ERRORS */}
        <div className="glass rounded-3xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Mic size={20} className="text-blue-400" />
            Word Alignment & Timeline
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {data.pronunciation?.words?.map((word: any, i: number) => (
              <div key={i} className={`p-4 rounded-xl flex justify-between items-center border ${word.status === 'error' ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-800/50 border-slate-700/50'}`}>
                <div>
                  <p className={`font-semibold text-lg ${word.status === 'error' ? 'text-red-400' : 'text-white'}`}>{word.word}</p>
                  <p className="text-xs text-slate-500">{word.start !== null ? `${word.start}s - ${word.end}s` : 'Missing'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-300">Score: {word.score}</span>
                  {word.status === 'error' ? <AlertTriangle size={20} className="text-red-400" /> : <CheckCircle2 size={20} className="text-green-400" />}
                </div>
              </div>
            ))}
            {data.pronunciation?.words?.length === 0 && <p className="text-slate-500 text-sm">No word alignment available.</p>}
          </div>

          {data.pronunciation?.errors?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <h4 className="text-slate-300 font-medium mb-3">Detected Errors</h4>
              <ul className="space-y-2">
                {data.pronunciation.errors.map((err: any, i: number) => (
                  <li key={i} className="text-sm text-red-300 bg-red-900/20 p-2 rounded flex items-center gap-2">
                    <AlertCircle size={14} /> Expected "{err.expected}", but detected "{err.spoken}"
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 3. RECOMMENDATIONS */}
        <div className="glass rounded-3xl p-6 border border-slate-700/50 flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ThumbsUp size={20} className="text-green-400" />
            AI Recommendations
          </h3>
          <div className="flex-1 space-y-4">
            {data.recommendation?.map((rec: any, i: number) => (
              <div key={i} className="flex gap-4 items-start bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                <div className="mt-1">
                  {rec.type === 'Strength' && <CheckCircle2 size={18} className="text-green-400" />}
                  {rec.type === 'Needs Improvement' && <AlertTriangle size={18} className="text-red-400" />}
                  {rec.type === 'Suggestion' && <Info size={18} className="text-blue-400" />}
                  {rec.type === 'Exercises' && <TrendingUp size={18} className="text-purple-400" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-1">{rec.type}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4. PITCH CONTOUR */}
        <div className="glass rounded-3xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Music size={20} className="text-purple-400" />
            Pitch Contour (Intonation)
          </h3>
          <div className="h-64">
            {pitchContourData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pitchContourData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="frame" tick={false} stroke="#64748b" />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                  <Line type="monotone" dataKey="pitch" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No Pitch Data</div>
            )}
          </div>
        </div>

        {/* 5. FORMANT SCATTER (VOWEL SPACE) */}
        <div className="glass rounded-3xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-orange-400" />
            Vowel Space (F1 vs F2)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="f2" name="F2 (Backness)" reversed domain={[500, 3000]} stroke="#64748b" />
                <YAxis type="number" dataKey="f1" name="F1 (Height)" reversed domain={[200, 1000]} stroke="#64748b" />
                <ZAxis range={[100, 100]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Scatter name="Your Voice" data={formantData} fill="#f97316">
                  <LabelList dataKey="name" position="top" fill="#94a3b8" fontSize={12} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
    </div>
  );
}
