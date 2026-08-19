import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getComparisonAnalytics, getPhoneticDeviations } from "../api/analytics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle, CheckCircle, Activity, Clock, ChevronDown, ChevronUp, Mic, FileText } from "lucide-react";

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [phonetics, setPhonetics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");
  
  // Toggles for the line chart
  const [showPronunciation, setShowPronunciation] = useState(true);
  const [showFluency, setShowFluency] = useState(true);
  const [showIntonation, setShowIntonation] = useState(false);
  const [showRhythm, setShowRhythm] = useState(false);
  const [showLowConfidence, setShowLowConfidence] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [res, phoneticsData] = await Promise.all([
            getComparisonAnalytics(period),
            getPhoneticDeviations(period)
        ]);
        setData(res);
        setPhonetics(phoneticsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  const { strongestArea, weakestArea, practicePriority } = useMemo(() => {
    if (!data?.summary) return { strongestArea: null, weakestArea: null, practicePriority: null };
    const stats = [
      { name: "Pronunciation", value: data.summary.pronunciation },
      { name: "Fluency", value: data.summary.fluency },
      { name: "Intonation", value: data.summary.intonation },
      { name: "Rhythm", value: data.summary.rhythm }
    ].filter(s => s.value !== null && s.value > 0);

    let strongestArea = null;
    let weakestArea = null;
    
    if (stats.length > 0) {
        strongestArea = stats.reduce((prev, current) => (prev.value > current.value) ? prev : current);
        weakestArea = stats.reduce((prev, current) => (prev.value < current.value) ? prev : current);
    }

    let practicePriority = null;
    if (phonetics) {
        const worstVowel = phonetics.mostDifficultVowels?.[0];
        const worstConsonant = phonetics.mostDifficultConsonants?.[0];
        
        const candidates = [worstVowel, worstConsonant].filter(Boolean);
        const calculateSeverity = (sound: any) => (100 - sound.accuracy) * (sound.occurrences || sound.attempts || 1);
        
        if (candidates.length > 0) {
            const worstSound = candidates.reduce((prev, current) => (calculateSeverity(prev) > calculateSeverity(current)) ? prev : current);
            practicePriority = { 
                type: 'phoneme', 
                value: `/${worstSound.phoneme}/`,
                subtext: `${worstSound.accuracy}% accuracy · ${worstSound.occurrences || worstSound.attempts || 0} occurrences · ${worstSound.mistakes || worstSound.errors || 0} mistakes`
            };
        }
    }
    if (!practicePriority && data?.wordStatistics?.length > 0) {
        const validWords = data.wordStatistics.filter((w: any) => w.confidence === 'High' || w.confidence === 'Medium');
        if (validWords.length > 0) {
             const w = validWords[0];
             practicePriority = { 
                 type: 'word', 
                 value: w.word,
                 subtext: `${w.avg_score.toFixed(1)} avg score · ${w.attempts} occurrences`
             };
        }
    }

    return { strongestArea, weakestArea, practicePriority };
  }, [data, phonetics]);

  const renderKPI = (title: string, score: number | null | undefined, change: number | null | undefined) => {
    const isPositive = change !== null && change !== undefined && change > 0;
    const isNegative = change !== null && change !== undefined && change < 0;
    const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
    const colorClass = isPositive ? "text-emerald-500" : isNegative ? "text-amber-500" : "text-slate-400";
    
    let statusText = "Good";
    if (score !== null && score !== undefined) {
        if (score >= 80) statusText = "Strong";
        else if (score < 60) statusText = "Needs Practice";
    }

    const hasTrend = change !== null && change !== undefined;
    const isAllTime = period === "all";

    return (
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className="mt-3 flex items-end justify-between">
          <div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{score ? score.toFixed(1) : "—"}</span>
              <div className="text-xs font-medium text-slate-500 mt-1">{score ? statusText : "No data"}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {hasTrend ? (
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-100 text-sm font-semibold bg-slate-50 ${colorClass}`} title="vs previous period">
                <Icon size={14} strokeWidth={2.5} />
                {Math.abs(change)}%
              </span>
            ) : !isAllTime ? (
              <span className="text-[10px] px-2 py-1 bg-slate-50 rounded-md border border-slate-100 text-slate-400 font-bold uppercase tracking-wider">Baseline</span>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const wordsToImprove = useMemo(() => {
      let words = data?.wordStatistics?.filter((w: any) => w.confidence === 'High' || w.confidence === 'Medium') || [];
      const confRank: Record<string, number> = { "High": 0, "Medium": 1, "Low": 2 };
      words.sort((a: any, b: any) => {
          if (confRank[a.confidence] !== confRank[b.confidence]) return confRank[a.confidence] - confRank[b.confidence];
          if (b.attempts !== a.attempts) return b.attempts - a.attempts;
          return a.avg_score - b.avg_score;
      });
      return words;
  }, [data]);

  const lowConfidenceWords = data?.wordStatistics?.filter((w: any) => w.confidence === 'Low') || [];
  const combinedNeedsAttention = phonetics ? [...(phonetics.mostDifficultVowels || []), ...(phonetics.mostDifficultConsonants || [])].sort((a: any, b: any) => a.accuracy - b.accuracy) : [];
  
  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Speech Performance</h1>
          <p className="text-slate-500 text-sm font-medium">Track your pronunciation progress over time.</p>
        </div>
        
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2.5 shadow-sm font-semibold outline-none cursor-pointer"
        >
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
          <option value="3m">3 Months</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {loading || !data ? (
        <div className="animate-pulse space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
               {[1,2,3,4].map(i => <div key={i} className="h-[120px] bg-white border border-slate-100 rounded-xl"></div>)}
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-[350px] bg-white border border-slate-100 rounded-xl lg:col-span-2"></div>
              <div className="h-[350px] bg-white border border-slate-100 rounded-xl lg:col-span-1"></div>
           </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {renderKPI("Pronunciation", data.summary?.pronunciation, data.changes?.pronunciation)}
              {renderKPI("Fluency", data.summary?.fluency, data.changes?.fluency)}
              {renderKPI("Intonation", data.summary?.intonation, data.changes?.intonation)}
              {renderKPI("Rhythm", data.summary?.rhythm, data.changes?.rhythm)}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Historical Progress Chart */}
             <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Historical Progress</h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                      <input type="checkbox" checked={showPronunciation} onChange={(e) => setShowPronunciation(e.target.checked)} className="rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer" /> Pronunciation
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                      <input type="checkbox" checked={showFluency} onChange={(e) => setShowFluency(e.target.checked)} className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer" /> Fluency
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                      <input type="checkbox" checked={showIntonation} onChange={(e) => setShowIntonation(e.target.checked)} className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer" /> Intonation
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                      <input type="checkbox" checked={showRhythm} onChange={(e) => setShowRhythm(e.target.checked)} className="rounded border-slate-300 text-purple-500 focus:ring-purple-500 cursor-pointer" /> Rhythm
                    </label>
                  </div>
                </div>

                <div className="flex-1 w-full min-h-[280px]">
                  {!data.progress || data.progress.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">Not enough history.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.progress} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} dy={15} />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} width={50} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: 12, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 600 }} cursor={{ fill: 'transparent', stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        {showPronunciation && <Line type="monotone" dataKey="pronunciation" name="Pronunciation" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />}
                        {showFluency && <Line type="monotone" dataKey="fluency" name="Fluency" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />}
                        {showIntonation && <Line type="monotone" dataKey="intonation" name="Intonation" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />}
                        {showRhythm && <Line type="monotone" dataKey="rhythm" name="Rhythm" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
             </div>

             {/* Performance Breakdown */}
             <div className="lg:col-span-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
                 <h3 className="text-base font-bold text-slate-900 mb-8 tracking-tight">Performance Breakdown</h3>
                 
                 <div className="flex-1 flex flex-col gap-6 justify-center">
                     <div>
                         <div className="flex items-center gap-2 mb-2">
                             <CheckCircle size={16} className="text-emerald-500" strokeWidth={2.5} />
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Strongest Area</span>
                         </div>
                         <div className="text-slate-900 font-bold text-lg">
                            {strongestArea ? `${strongestArea.name} — ${strongestArea.value.toFixed(1)}` : 'Not enough data'}
                         </div>
                         {strongestArea && <div className="text-xs font-medium text-slate-500 mt-1">Your strongest dimension.</div>}
                     </div>
                     
                     <div className="w-full h-px bg-slate-100"></div>

                     <div>
                         <div className="flex items-center gap-2 mb-2">
                             <Activity size={16} className="text-amber-500" strokeWidth={2.5} />
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Needs Most Attention</span>
                         </div>
                         <div className="text-slate-900 font-bold text-lg">
                            {weakestArea ? `${weakestArea.name} — ${weakestArea.value.toFixed(1)}` : 'Not enough data'}
                         </div>
                         {weakestArea && <div className="text-xs font-medium text-slate-500 mt-1">Your weakest dimension across the selected period.</div>}
                     </div>

                     <div className="w-full h-px bg-slate-100"></div>

                     <div>
                         <div className="flex items-center gap-2 mb-2">
                             <Target size={16} className="text-blue-500" strokeWidth={2.5} />
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Practice Priority</span>
                         </div>
                         <div className="text-slate-900 font-bold text-lg">
                            {practicePriority ? practicePriority.value : 'Complete more sessions.'}
                         </div>
                         {practicePriority && practicePriority.subtext && (
                             <div className="text-xs font-medium text-slate-500 mt-1">{practicePriority.subtext}</div>
                         )}
                     </div>
                 </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Words To Improve */}
             <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
                 <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Words to Improve</h3>
                 
                 {wordsToImprove.length > 0 ? (
                     <div className="flex-1 overflow-x-auto">
                         <table className="w-full text-left whitespace-nowrap">
                             <thead>
                                 <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                     <th className="pb-3 pr-4 font-bold">Word</th>
                                     <th className="pb-3 px-4 font-bold text-center">Avg Score</th>
                                     <th className="pb-3 px-4 font-bold text-center">Occurrences</th>
                                     <th className="pb-3 px-4 font-bold text-center">Confidence</th>
                                     <th className="pb-3 pl-4 font-bold text-right">Trend</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {wordsToImprove.map((w: any, idx: number) => (
                                     <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                         <td className="py-3.5 pr-4 font-bold text-slate-800 text-sm">{w.word}</td>
                                         <td className="py-3.5 px-4 text-center">
                                            <span className={`inline-flex font-bold text-xs px-2.5 py-1 rounded-md ${w.avg_score >= 80 ? 'bg-emerald-50 text-emerald-700' : w.avg_score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                               {w.avg_score.toFixed(1)}
                                            </span>
                                         </td>
                                         <td className="py-3.5 px-4 text-center text-xs">
                                            <div className="font-bold text-slate-700">{w.attempts} <span className="font-medium text-slate-500">occurrences</span></div>
                                            <div className="font-medium text-slate-400 mt-0.5">{w.unique_sessions || 1} sessions</div>
                                         </td>
                                         <td className="py-3.5 px-4 text-center">
                                            {w.confidence === 'High' && <span className="inline-flex text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-extrabold tracking-wide">HIGH</span>}
                                            {w.confidence === 'Medium' && <span className="inline-flex text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-extrabold tracking-wide">MEDIUM</span>}
                                         </td>
                                         <td className="py-3.5 pl-4 text-right">
                                            {w.trend !== null && w.trend !== undefined ? (
                                                <div className={`inline-flex items-center gap-1 text-sm font-bold ${w.trend > 0 ? 'text-emerald-500' : w.trend < 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                    {w.trend > 0 ? <TrendingUp size={14} strokeWidth={2.5} /> : w.trend < 0 ? <TrendingDown size={14} strokeWidth={2.5} /> : <Minus size={14} strokeWidth={2.5} />}
                                                    <span>{w.trend > 0 ? '+' : ''}{w.trend}%</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] px-2 py-1 bg-slate-50 rounded-md border border-slate-100 text-slate-400 font-bold uppercase tracking-wider">Baseline</span>
                                            )}
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 ) : (
                     <div className="flex-1 flex items-center justify-center p-6 text-slate-400 text-sm font-medium bg-slate-50 rounded-lg border border-dashed border-slate-200">
                         No recurring pronunciation issues identified.
                     </div>
                 )}
                 
                 {lowConfidenceWords.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-slate-100">
                         <button 
                            onClick={() => setShowLowConfidence(!showLowConfidence)}
                            className="flex items-center justify-between w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                         >
                            <span>Excluded low-confidence results ({lowConfidenceWords.length})</span>
                            {showLowConfidence ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
                         </button>
                         {showLowConfidence && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {lowConfidenceWords.map((w: any, idx: number) => (
                                    <span key={idx} className="text-xs font-semibold bg-slate-50 text-slate-500 px-2.5 py-1.5 rounded-md border border-slate-200" title={`Score: ${w.avg_score}`}>
                                        {w.word}
                                    </span>
                                ))}
                            </div>
                         )}
                     </div>
                 )}
             </div>

             {/* Phonetic Deviations */}
             <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col h-[400px]">
                <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">Phonetic Deviations</h3>
                <p className="text-xs font-medium text-slate-500 mb-6">Repeated deviations detected across multiple sessions.</p>
                
                {!phonetics || (combinedNeedsAttention.length === 0 && (!phonetics.bestPronouncedSounds || phonetics.bestPronouncedSounds.length === 0)) ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 text-sm font-medium bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        No phonetic history available yet.
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-3 space-y-7 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        
                        {combinedNeedsAttention.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 text-[11px] font-bold text-amber-600 mb-3 uppercase tracking-wider">
                                    <AlertCircle size={14} strokeWidth={2.5} /> Needs Attention
                                </h4>
                                <div className="space-y-3">
                                    {combinedNeedsAttention.map((item: any, idx: number) => (
                                        <div key={idx} className="flex flex-col bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="bg-amber-50 text-amber-700 border border-amber-100 text-sm font-bold px-3 py-1 rounded-md">/{item.phoneme}/</span>
                                                <span className="text-slate-900 text-sm font-bold">{item.accuracy !== null ? item.accuracy + '%' : '—'} Accuracy</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mistakes</p>
                                                    <p className="text-amber-600 font-extrabold text-sm">{item.mistakes ?? '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Occurrences</p>
                                                    <p className="text-slate-700 font-extrabold text-sm">{item.occurrences ?? '—'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {phonetics.bestPronouncedSounds?.length > 0 && (
                            <div>
                                <h4 className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 mb-3 uppercase tracking-wider">
                                    <CheckCircle size={14} strokeWidth={2.5} /> Best Pronounced
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {phonetics.bestPronouncedSounds.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between gap-4 bg-white rounded-lg px-4 py-2.5 border border-slate-200 shadow-sm w-full sm:w-[calc(50%-0.375rem)]">
                                            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-1 rounded-md text-sm border border-emerald-100">/{item.phoneme}/</span>
                                            <span className="text-slate-700 text-sm font-bold">{item.accuracy !== null ? item.accuracy + '%' : '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Speech Statistics */}
             <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                 <h3 className="text-base font-bold text-slate-900 mb-6 tracking-tight">Speech Statistics</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                     <div className="flex flex-col gap-1.5">
                         <div className="flex items-center gap-1.5 text-slate-500">
                             <Mic size={14} strokeWidth={2.5} />
                             <span className="text-[11px] font-bold uppercase tracking-wider">Speech Rate</span>
                         </div>
                         <div className="text-2xl font-extrabold text-slate-900">
                             {data.speakingStatistics?.wpm ? data.speakingStatistics.wpm.toFixed(0) : 0} <span className="text-sm font-semibold text-slate-500 lowercase">wpm</span>
                         </div>
                     </div>
                     <div className="flex flex-col gap-1.5 border-l border-slate-100 pl-4">
                         <div className="flex items-center gap-1.5 text-slate-500">
                             <Clock size={14} strokeWidth={2.5} />
                             <span className="text-[11px] font-bold uppercase tracking-wider">Pause Ratio</span>
                         </div>
                         <div className="text-2xl font-extrabold text-slate-900">
                             {data.speakingStatistics?.pause_ratio ? data.speakingStatistics.pause_ratio.toFixed(1) : 0}<span className="text-sm font-semibold text-slate-500">%</span>
                         </div>
                     </div>
                     <div className="flex flex-col gap-1.5 border-l border-slate-100 pl-4">
                         <div className="flex items-center gap-1.5 text-slate-500">
                             <Activity size={14} strokeWidth={2.5} />
                             <span className="text-[11px] font-bold uppercase tracking-wider">Sessions</span>
                         </div>
                         <div className="text-2xl font-extrabold text-slate-900">
                             {data.progress?.length || 0}
                         </div>
                     </div>
                     <div className="flex flex-col gap-1.5 border-l border-slate-100 pl-4">
                         <div className="flex items-center gap-1.5 text-slate-500">
                             <FileText size={14} strokeWidth={2.5} />
                             <span className="text-[11px] font-bold uppercase tracking-wider">Analyses</span>
                         </div>
                         <div className="text-2xl font-extrabold text-slate-900">
                             {data.progress?.length || 0}
                         </div>
                     </div>
                 </div>
             </div>

             {/* Secondary Radar Chart */}
             <div className="lg:col-span-1 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="text-base font-bold text-slate-900 mb-2 w-full text-left tracking-tight">Ability Profile</h3>
                <div className="h-[220px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data.radarData}>
                         <PolarGrid stroke="#f1f5f9" />
                         <PolarAngleAxis dataKey="dimension" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                         <Radar name="You" dataKey="You" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                         <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: 12, padding: '8px', fontWeight: 600 }} itemStyle={{ color: '#0f172a' }} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
