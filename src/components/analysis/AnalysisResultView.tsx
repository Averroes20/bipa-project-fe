import { useState, useRef } from "react";
import { CheckCircle2, AlertTriangle, ThumbsUp, Music, Mic, Activity, ChevronDown, ChevronRight, Volume2, ListMusic, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ScatterChart, Scatter, ZAxis, LabelList, Legend } from "recharts";
import type { AnalysisResponse, WordAnalysis, PhonemeAnalysis } from "../../api/analyze";

interface Props {
   data: AnalysisResponse;
}

export default function AnalysisResultView({ data }: Props) {
   const [selectedWord, setSelectedWord] = useState<WordAnalysis | null>(null);
   const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeAnalysis | null>(null);
   const [showTechnical, setShowTechnical] = useState(false);
   
   const audioRef = useRef<HTMLAudioElement | null>(null);
   const [playingType, setPlayingType] = useState<string | null>(null);

   if (!data) return null;

   // 1. PITCH CONTOUR
   const pitchLen = Math.max(
      data.intonation?.user_contour?.length || 0,
      data.intonation?.male_contour?.length || 0,
      data.intonation?.female_contour?.length || 0
   );

   const pitchContourData = Array.from({ length: pitchLen }).map((_, i) => ({
      time: i,
      user: data.intonation?.user_contour?.[i] ?? null,
      male: data.intonation?.male_contour?.[i] ?? null,
      female: data.intonation?.female_contour?.[i] ?? null
   }));

   // 2. VOWEL SPACE DATA
   const vowelSpace = data.phonetics?.vowel_space?.vowels || [];
   const vowelEllipses = data.phonetics?.vowel_space?.ellipse || [];
   
   const userVowels = vowelSpace.map(v => ({ f1: v.user.f1, f2: v.user.f2, name: v.phoneme }));
   const maleVowels = vowelSpace.map(v => ({ f1: v.native_male.f1, f2: v.native_male.f2, name: v.phoneme }));
   const femaleVowels = vowelSpace.map(v => ({ f1: v.native_female.f1, f2: v.native_female.f2, name: v.phoneme }));
   
   // Sort vowels by match ascending
   const sortedVowels = [...vowelSpace].sort((a, b) => a.match - b.match);

   // 4. PHONEMES FOR SELECTED WORD
   const selectedPhonemes = selectedWord
      ? data.pronunciation?.phonemes?.filter(p => p.start >= selectedWord.start && p.end <= selectedWord.end)
      : [];

   // Audio Playback Handler
   const playAudio = (type: 'user' | 'male' | 'female', url: string) => {
      if (audioRef.current) {
         audioRef.current.pause();
         if (playingType === type) {
            setPlayingType(null);
            return;
         }
      }
      
      const baseUrl = "http://localhost:8000/"; // Update based on config
      const audioUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingType(type);
      
      audio.play().catch(e => console.error("Playback failed", e));
      audio.onended = () => setPlayingType(null);
   };

   // Render Ellipse Custom Shape
   const renderEllipse = (props: any) => {
      const { cx, cy, payload } = props;
      const ellipseData = vowelEllipses.find(e => e.phoneme === payload.name);
      if (!ellipseData) return <circle cx={cx} cy={cy} r={4} fill={props.fill} />;
      
      // Rough mapping for visual representation of ellipse in scatter
      return (
         <g>
            <ellipse cx={cx} cy={cy} rx={Math.max(10, ellipseData.radius_f2/10)} ry={Math.max(10, ellipseData.radius_f1/10)} fill={props.fill} fillOpacity={0.2} stroke={props.fill} strokeDasharray="3 3"/>
            <circle cx={cx} cy={cy} r={4} fill={props.fill} />
         </g>
      );
   };

   return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">

         {/* 1. OVERALL SCORE CARD */}
         <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="z-10 w-full md:w-auto text-center md:text-left">
               <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-2">Overall Pronunciation Score</p>
               <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <h2 className="text-6xl font-bold text-slate-900">{Math.round(data.overall_score)}</h2>
                  <span className="text-2xl text-slate-400">/100</span>
               </div>
               <p className="text-blue-600 mt-2 font-medium text-sm">Profile Match: {data.voice_profile}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto z-10 flex-1 justify-end">
               <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-blue-300 transition-colors shadow-sm">
                  <p className="text-slate-500 text-xs uppercase mb-1 font-semibold tracking-wider">Pronunciation</p>
                  <p className="text-3xl font-bold text-slate-900 mb-2">{Math.round(data.dimensions?.pronunciation || 0)}</p>
                  <p className="text-xs text-slate-500">Word correctness</p>
               </div>
               <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-purple-300 transition-colors shadow-sm">
                  <p className="text-slate-500 text-xs uppercase mb-1 font-semibold tracking-wider">Intonation</p>
                  <p className="text-3xl font-bold text-slate-900 mb-2">{Math.round(data.dimensions?.intonation || 0)}</p>
                  <p className="text-xs text-slate-500">Pitch contour</p>
               </div>
               <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-emerald-300 transition-colors shadow-sm">
                  <p className="text-slate-500 text-xs uppercase mb-1 font-semibold tracking-wider">Fluency</p>
                  <p className="text-3xl font-bold text-slate-900 mb-2">{Math.round(data.dimensions?.fluency || 0)}</p>
                  <p className="text-xs text-slate-500">Speech rhythm</p>
               </div>
               <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-amber-300 transition-colors shadow-sm">
                  <p className="text-slate-500 text-xs uppercase mb-1 font-semibold tracking-wider">Clarity</p>
                  <p className="text-3xl font-bold text-slate-900 mb-2">{Math.round(data.dimensions?.clarity || 0)}</p>
                  <p className="text-xs text-slate-500">Articulation</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2. AI TEACHER 2.0 */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col">
               <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <ThumbsUp size={18} className="text-green-500" />
                  AI Teacher Recommendations
               </h3>

               {data.teacher ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl">
                        <h4 className="text-emerald-700 font-semibold mb-3 text-sm flex items-center gap-2"><CheckCircle2 size={16} /> What You're Doing Well</h4>
                        <ul className="space-y-2">
                           {data.teacher.strengths?.map((s, i) => (
                              <li key={i} className="text-slate-700 text-sm flex items-start gap-2">
                                 <span className="text-emerald-500 mt-1">•</span> {s}
                              </li>
                           ))}
                        </ul>
                     </div>

                     <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl">
                        <h4 className="text-amber-700 font-semibold mb-3 text-sm flex items-center gap-2"><AlertTriangle size={16} /> Focus Next</h4>
                        <ul className="space-y-2">
                           {data.teacher.focus?.map((f, i) => (
                              <li key={i} className="text-slate-700 text-sm flex items-start gap-2">
                                 <span className="text-amber-500 mt-1">•</span> {f}
                              </li>
                           ))}
                        </ul>
                     </div>

                     <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                        <h4 className="text-blue-700 font-semibold mb-3 text-sm flex items-center gap-2"><Mic size={16} /> Practice Now</h4>
                        <ul className="space-y-2">
                           {data.teacher.practice?.map((p, i) => (
                              <li key={i} className="text-slate-700 text-sm flex items-start gap-2">
                                 <span className="text-blue-500 mt-1">•</span> {p}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               ) : (
                  <div className="p-8 text-center text-slate-400">AI Teacher data unavailable.</div>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 3. WORD ALIGNMENT & PLAYBACK */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col">
               <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Mic size={18} className="text-blue-500" />
                  Interactive Word Alignment
               </h3>
               <p className="text-sm text-slate-500 mb-4">Select a word to view detailed pronunciation feedback.</p>

               <div className="flex flex-wrap gap-2 mb-6 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                  {data.pronunciation?.words?.length > 0 ? (
                     data.pronunciation.words.map((word, i) => (
                        <button
                           key={i}
                           onClick={() => { setSelectedWord(word); setSelectedPhoneme(null); }}
                           className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedWord?.word === word.word
                                 ? 'ring-2 ring-blue-500 scale-105 shadow-md'
                                 : 'hover:bg-slate-100'
                              } ${word.status === 'error' ? 'bg-red-50 text-red-600 border border-red-200' 
                                 : word.status === 'needs_improvement' ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                 : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                        >
                           {word.word}
                        </button>
                     ))
                  ) : (
                     <p className="text-slate-500 text-sm">Word-level alignment is unavailable.</p>
                  )}
               </div>

               {/* FEATURE 5: PLAYBACK COMPARISON */}
               {data.playback && (
                  <div className="mt-auto border-t border-slate-200 pt-4">
                     <h4 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2">Playback Comparison</h4>
                     <div className="flex flex-col gap-2">
                        <button 
                           onClick={() => playAudio('user', data.playback.user)}
                           className={`flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-colors ${playingType === 'user' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                        >
                           <Volume2 size={16} className={playingType === 'user' ? 'text-blue-500' : 'text-slate-400'} />
                           Your Pronunciation
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                           <button 
                              onClick={() => playAudio('female', data.playback.female)}
                              className={`flex justify-center items-center gap-2 p-2 rounded-lg border text-sm font-medium transition-colors ${playingType === 'female' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                           >
                              <Volume2 size={16} className={playingType === 'female' ? 'text-purple-500' : 'text-slate-400'} />
                              Native Female
                           </button>
                           <button 
                              onClick={() => playAudio('male', data.playback.male)}
                              className={`flex justify-center items-center gap-2 p-2 rounded-lg border text-sm font-medium transition-colors ${playingType === 'male' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                           >
                              <Volume2 size={16} className={playingType === 'male' ? 'text-teal-500' : 'text-slate-400'} />
                              Native Male
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* FEATURE 1: INTERACTIVE PHONEME DETAIL */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300">
               <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <ListMusic size={18} className="text-purple-500" />
                  Phoneme Detail
               </h3>

               {selectedWord ? (
                  <div>
                     <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
                        <div>
                           <p className="text-sm text-slate-500 mb-1">Selected Word</p>
                           <p className="text-3xl font-bold text-slate-900">{selectedWord.word.toUpperCase()}</p>
                           <p className="text-xs text-slate-400 mt-1">{selectedWord.start.toFixed(2)}s — {selectedWord.end.toFixed(2)}s</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm text-slate-500 mb-1">Score</p>
                           <p className={`text-2xl font-bold ${selectedWord.status === 'error' ? 'text-red-500' : selectedWord.status === 'needs_improvement' ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {Math.round(selectedWord.score)}
                           </p>
                        </div>
                     </div>

                     {selectedPhonemes.length > 0 ? (
                        <div className="space-y-4">
                           <div className="flex flex-wrap gap-2">
                              {selectedPhonemes.map((ph, i) => (
                                 <button 
                                    key={i} 
                                    onClick={() => setSelectedPhoneme(ph)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[60px] border transition-all duration-200 ${
                                       selectedPhoneme === ph ? 'ring-2 ring-blue-400 shadow-md scale-105' : 'hover:bg-slate-50 hover:scale-105'
                                    } ${
                                       ph.status === 'weak' ? 'bg-red-50 border-red-200' : 
                                       ph.status === 'acceptable' ? 'bg-amber-50 border-amber-200' : 
                                       'bg-emerald-50 border-emerald-200'
                                    }`}
                                 >
                                    <span className={`text-xl font-bold mb-1 ${
                                       ph.status === 'weak' ? 'text-red-600' : 
                                       ph.status === 'acceptable' ? 'text-amber-600' : 
                                       'text-emerald-600'
                                    }`}>/{ph.symbol}/</span>
                                 </button>
                              ))}
                           </div>

                           {/* Inline Expandable Panel */}
                           {selectedPhoneme && (
                              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 duration-200">
                                 <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm font-bold uppercase tracking-wider ${
                                       selectedPhoneme.status === 'weak' ? 'text-red-600' : 
                                       selectedPhoneme.status === 'acceptable' ? 'text-amber-600' : 
                                       'text-emerald-600'
                                    }`}>
                                       {selectedPhoneme.status} {selectedPhoneme.score < 100 ? 'Consonant/Vowel' : ''}
                                    </span>
                                    <span className="font-mono text-sm font-semibold bg-white px-2 py-1 rounded border">
                                       Score: {Math.round(selectedPhoneme.score)}
                                    </span>
                                 </div>
                                 <p className="text-slate-700 text-sm">
                                    <span className="font-bold text-lg mr-2">/{selectedPhoneme.symbol}/</span>
                                    {selectedPhoneme.feedback || "Phoneme is articulated correctly."}
                                 </p>
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
                           <p className="text-slate-500 text-sm">Phoneme-level analysis is unavailable for this word.</p>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="h-full min-h-[200px] flex items-center justify-center text-slate-400 text-sm flex-col gap-3">
                     <Mic size={32} className="opacity-20" />
                     Select a word from the timeline to see its phonemes.
                  </div>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 7 & FEATURE 2: PITCH CONTOUR & INSIGHT */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col">
               <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Music size={18} className="text-purple-500" />
                  Pitch Contour (Intonation)
               </h3>
               
               <div className="h-56 mb-4">
                  {pitchContourData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={pitchContourData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                           <XAxis dataKey="time" tick={false} stroke="#94a3b8" axisLine={false} tickLine={false} />
                           <YAxis domain={['auto', 'auto']} stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                           <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
                           <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', color: '#64748b' }} />
                           <Line type="monotone" dataKey="user" name="You" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
                           <Line type="monotone" dataKey="male" name="Native Male" stroke="#14b8a6" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
                           <Line type="monotone" dataKey="female" name="Native Female" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
                        </LineChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="h-full flex items-center justify-center text-slate-400 text-sm">Pitch contour is unavailable for this recording.</div>
                  )}
               </div>

               {/* Pitch Insight Engine */}
               {data.intonation?.pitch_insight && (
                  <div className="mt-auto bg-slate-50 rounded-xl p-4 border border-slate-200">
                     <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                        {data.intonation.pitch_insight.pattern === 'falling' ? <ArrowDownRight size={16} className="text-blue-500"/> :
                         data.intonation.pitch_insight.pattern === 'rising' ? <ArrowUpRight size={16} className="text-amber-500"/> :
                         <Minus size={16} className="text-slate-500"/>}
                        Pitch Insight: {data.intonation.pitch_insight.pattern.charAt(0).toUpperCase() + data.intonation.pitch_insight.pattern.slice(1)} Pattern
                     </h4>
                     <p className="text-sm text-slate-600 mb-3">{data.intonation.pitch_insight.summary}</p>
                     
                     <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white p-2 rounded border border-slate-100 text-center">
                           <p className="text-[10px] text-slate-500 uppercase">Native Drop</p>
                           <p className="font-mono text-sm font-semibold">{data.intonation.pitch_insight.native_drop_hz} Hz</p>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-100 text-center">
                           <p className="text-[10px] text-slate-500 uppercase">Your Drop</p>
                           <p className="font-mono text-sm font-semibold">{data.intonation.pitch_insight.terminal_drop_hz} Hz</p>
                        </div>
                        <div className={`p-2 rounded border text-center ${
                           data.intonation.pitch_insight.difference_hz < 10 ? 'bg-emerald-50 border-emerald-200' :
                           data.intonation.pitch_insight.difference_hz <= 25 ? 'bg-amber-50 border-amber-200' :
                           'bg-red-50 border-red-200'
                        }`}>
                           <p className="text-[10px] uppercase opacity-70">Difference</p>
                           <p className="font-mono text-sm font-bold">{data.intonation.pitch_insight.difference_hz} Hz</p>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* 8 & FEATURE 3: VOWEL SPACE CENTROID */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col">
               <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Activity size={18} className="text-orange-500" />
                  Vowel Space Centroid
               </h3>
               <p className="text-sm text-slate-500 mb-4">
                  {sortedVowels.length > 0 ? (
                     <>Your closest vowel: <span className="font-bold">/{sortedVowels[sortedVowels.length-1].phoneme}/</span>. Needs improvement: <span className="font-bold">/{sortedVowels[0].phoneme}/</span></>
                  ) : "Analysis of your vowel articulation placements."}
               </p>
               
               <div className="h-56 mb-4">
                  {userVowels.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                           <YAxis type="number" dataKey="f1" name="F1 (Height)" reversed domain={['auto', 'auto']} stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                           <XAxis type="number" dataKey="f2" name="F2 (Backness)" reversed domain={['auto', 'auto']} stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                           <ZAxis range={[100, 100]} />
                           <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
                           <Scatter name="You" data={userVowels} fill="#3b82f6" shape="circle">
                              <LabelList dataKey="name" position="top" fill="#64748b" fontSize={12} fontWeight="bold" />
                           </Scatter>
                           <Scatter name="Native Male" data={maleVowels} fill="#14b8a6" shape={renderEllipse} />
                           <Scatter name="Native Female" data={femaleVowels} fill="#8b5cf6" shape={renderEllipse} />
                        </ScatterChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="h-full flex items-center justify-center text-slate-400 text-sm">Vowel formants could not be extracted.</div>
                  )}
               </div>

               {/* Legend & Match Table */}
               {sortedVowels.length > 0 && (
                  <div className="mt-auto border-t border-slate-200 pt-4">
                     <div className="flex gap-4 justify-center mb-3">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-xs text-slate-600">You</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-teal-500 opacity-50 border border-teal-500 border-dashed"></div><span className="text-xs text-slate-600">Native Male</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-500 opacity-50 border border-purple-500 border-dashed"></div><span className="text-xs text-slate-600">Native Female</span></div>
                     </div>
                     <div className="grid grid-cols-5 gap-2">
                        {sortedVowels.map((v, i) => (
                           <div key={i} className="bg-slate-50 p-2 rounded text-center border border-slate-100">
                              <p className="text-[10px] text-slate-400 uppercase font-semibold">/{v.phoneme}/</p>
                              <p className={`text-sm font-bold ${v.match >= 80 ? 'text-emerald-600' : v.match >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{v.match}%</p>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>
         
         <div className="flex justify-center mt-12 pb-8">
            <button
               onClick={() => setShowTechnical(!showTechnical)}
               className="px-6 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 text-sm font-medium"
            >
               Technical Data Inspector
               {showTechnical ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
            </button>
         </div>

         {/* 11. TECHNICAL DETAILS */}
         {showTechnical && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-300">
               <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                     <p className="text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-wider">pitch_mean</p>
                     <p className="font-mono text-sm text-green-400">{data.pitch?.mean?.toFixed(4) || "N/A"}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-wider">energy_mean</p>
                     <p className="font-mono text-sm text-green-400">{data.energy?.mean?.toFixed(4) || "N/A"}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-wider">pause_ratio</p>
                     <p className="font-mono text-sm text-green-400">{data.pause?.ratio?.toFixed(4) || "N/A"}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-wider">speaking_rate</p>
                     <p className="font-mono text-sm text-green-400">{data.accent?.speaking_rate_wpm?.toFixed(4) || "N/A"}</p>
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-400 mb-1 font-mono uppercase tracking-wider">dtw_distance</p>
                     <p className="font-mono text-sm text-green-400">{data.intonation?.similarity_score?.toFixed(4) || "N/A"}</p>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
