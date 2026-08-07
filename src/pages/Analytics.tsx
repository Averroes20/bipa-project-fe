import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { getComparisonAnalytics, getPhoneticDeviations } from "../api/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Brain, MessageSquare, Languages } from "lucide-react";

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [phonetics, setPhonetics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [res, phoneticsData] = await Promise.all([
            getComparisonAnalytics(),
            getPhoneticDeviations()
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
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Speech Performance Analytics</h1>
        <p className="text-slate-500 text-sm">Deep-dive multidimensional comparison of your pronunciation vs native speakers.</p>
      </div>

      {loading || !data ? (
        <div className="animate-pulse space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-[350px] bg-white border border-slate-200 shadow-sm rounded-2xl lg:col-span-1"></div>
              <div className="h-[350px] bg-white border border-slate-200 shadow-sm rounded-2xl lg:col-span-2"></div>
           </div>
           <div className="h-64 bg-white border border-slate-200 shadow-sm rounded-2xl w-full"></div>
        </div>
      ) : (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Speech Ability Radar */}
             <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-2 w-full text-left">Speech Ability Radar</h3>
                <div className="h-[280px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data.radarData}>
                         <PolarGrid stroke="#e2e8f0" />
                         <PolarAngleAxis dataKey="dimension" tick={{ fill: '#64748b', fontSize: 12 }} />
                         <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                         <Radar name="Native Reference" dataKey="Native Reference" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                         <Radar name="You" dataKey="You" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                         <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} itemStyle={{ color: '#0f172a' }} />
                         <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px', color: '#64748b' }} />
                      </RadarChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Dimension Comparisons */}
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {["pronunciation", "fluency", "intonation", "clarity"].map((dim) => (
                    <div key={dim} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-2 capitalize">{dim} Comparison</h3>
                      <div className="h-[140px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data[`${dim}Comparison`]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" hide />
                            <YAxis domain={[0, 100]} stroke="#cbd5e1" tick={{ fill: '#64748b', fontSize: 11 }} width={30} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: 12, borderRadius: '8px' }} itemStyle={{ color: '#0f172a' }} cursor={{fill: '#f8fafc'}} />
                            <Legend wrapperStyle={{ fontSize: 11, paddingTop: '5px', color: '#64748b' }} />
                            <Bar dataKey="You" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="Native Male" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="Native Female" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                 ))}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* AI Insights */}
             <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex flex-col justify-center shadow-sm">
                 <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                     <Brain className="text-blue-500" size={20} /> Comparison Insights
                 </h3>
                 <p className="text-slate-700 leading-relaxed text-sm">
                     {data.aiInsights}
                 </p>
                 
                 <div className="mt-6 space-y-4">
                     <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-slate-200">
                         <span className="text-slate-500 text-sm font-medium">Avg Speech Rate</span>
                         <span className="text-slate-900 font-bold">{data.speakingStatistics?.wpm} WPM</span>
                     </div>
                     <div className="flex justify-between items-center bg-white rounded-lg p-3 border border-slate-200">
                         <span className="text-slate-500 text-sm font-medium">Avg Pause</span>
                         <span className="text-slate-900 font-bold">{data.speakingStatistics?.avg_pause_duration}s</span>
                     </div>
                 </div>
             </div>

             {/* Phonetics Analytics */}
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Word Analytics */}
                 <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <MessageSquare size={18} className="text-emerald-500" /> Word Analytics
                    </h3>
                    {data.wordStatistics?.length > 0 ? (
                        <div className="space-y-3">
                            {data.wordStatistics.map((w: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 rounded-lg px-4 py-2 border border-slate-100">
                                    <span className="text-slate-800 font-medium">{w.word}</span>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500">{w.frequency} errors</div>
                                        <div className="text-sm font-semibold text-red-500">{w.accuracy}% acc</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 italic text-sm">Not enough data collected yet.</p>
                    )}
                 </div>

                 {/* Vowel & Phoneme Analytics */}
                 <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full flex flex-col">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Languages size={18} className="text-purple-500" /> Phonetic Deviations
                    </h3>
                    
                    {!phonetics || (!phonetics.mostDifficultVowels?.length && !phonetics.mostDifficultConsonants?.length) ? (
                        <div className="text-center py-8 flex-1 flex flex-col justify-center">
                            <p className="text-slate-400 text-sm">Complete more pronunciation tasks to unlock phonetic statistics.</p>
                        </div>
                    ) : (
                        <div className="space-y-5 overflow-y-auto pr-2" style={{ maxHeight: "400px" }}>
                            {/* Most Difficult Vowels */}
                            {phonetics.mostDifficultVowels?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Most Difficult Vowels</h4>
                                    <div className="space-y-2">
                                        {phonetics.mostDifficultVowels.map((item: any, idx: number) => (
                                            <div key={idx} className="flex flex-col bg-red-50 rounded-lg p-3 border border-red-100 gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="bg-white border border-red-200 text-red-600 text-sm font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">🟥 /{item.phoneme}/</span>
                                                    <span className="text-slate-700 text-sm font-medium">Accuracy: {item.accuracy}%</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                    <div>
                                                        <p className="text-slate-500">Mistakes</p>
                                                        <p className="text-red-600 font-medium">{item.mistakes}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Occurrences</p>
                                                        <p className="text-slate-700 font-medium">{item.occurrences}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Improvement</p>
                                                        <p className="text-blue-600 font-medium">{item.improvement > 0 ? '+' : ''}{item.improvement}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Most Difficult Consonants */}
                            {phonetics.mostDifficultConsonants?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Most Difficult Consonants</h4>
                                    <div className="space-y-2">
                                        {phonetics.mostDifficultConsonants.map((item: any, idx: number) => (
                                            <div key={idx} className="flex flex-col bg-red-50 rounded-lg p-3 border border-red-100 gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="bg-white border border-red-200 text-red-600 text-sm font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">🟥 /{item.phoneme}/</span>
                                                    <span className="text-slate-700 text-sm font-medium">Accuracy: {item.accuracy}%</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                    <div>
                                                        <p className="text-slate-500">Mistakes</p>
                                                        <p className="text-red-600 font-medium">{item.mistakes}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Occurrences</p>
                                                        <p className="text-slate-700 font-medium">{item.occurrences}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Improvement</p>
                                                        <p className="text-blue-600 font-medium">{item.improvement > 0 ? '+' : ''}{item.improvement}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Best Pronounced Sounds */}
                            {phonetics.bestPronouncedSounds?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Best Pronounced Sounds</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {phonetics.bestPronouncedSounds.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-1.5 bg-emerald-50 rounded-full px-3 py-1 border border-emerald-200">
                                                <span className="text-emerald-600 text-xs font-bold">🟩 /{item.phoneme}/</span>
                                                <span className="text-slate-600 text-xs font-medium">{item.accuracy}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Most Improved Sounds */}
                            {phonetics.mostImprovedSounds?.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Most Improved Sounds</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {phonetics.mostImprovedSounds.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-1.5 bg-blue-50 rounded-full px-3 py-1 border border-blue-200">
                                                <span className="text-blue-600 text-xs font-bold">🟦 /{item.phoneme}/</span>
                                                <span className="text-slate-600 text-xs font-medium">+{item.improvement}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                 </div>
             </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
