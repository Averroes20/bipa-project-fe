import { useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, ThumbsUp, Music, Mic, Activity, ChevronDown, ChevronRight, Volume2, Clock, Zap, MessageSquare, ListMusic, User } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ScatterChart, Scatter, ZAxis, LabelList, BarChart, Bar, Cell, YAxis as BarYAxis, XAxis as BarXAxis, Legend } from "recharts";
import type { AnalysisResponse, WordAnalysis } from "../../api/analyze";

interface Props {
  data: AnalysisResponse;
}

export default function AnalysisResultView({ data }: Props) {
  const [selectedWord, setSelectedWord] = useState<WordAnalysis | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);

  if (!data) return null;

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

  const formantData = data.phonetics?.vowel_space?.length > 0 
    ? data.phonetics.vowel_space.map(v => ({
        f1: v.f1,
        f2: v.f2,
        name: v.vowel
      }))
    : [];

  const comparisonData = [
    { name: "Native Female", score: Math.round((data.similarity?.female || 0) * 100), fill: "#8b5cf6" },
    { name: "Native Male", score: Math.round((data.similarity?.male || 0) * 100), fill: "#3b82f6" },
    { name: "You", score: Math.round(data.overall_score), fill: "#f59e0b" },
  ];

  // Phonemes for selected word
  const selectedPhonemes = selectedWord 
    ? data.pronunciation?.phonemes?.filter(p => p.start >= selectedWord.start && p.end <= selectedWord.end)
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. OVERALL SCORE CARD */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="z-10 w-full md:w-auto text-center md:text-left">
          <p className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-2">Overall Pronunciation Score</p>
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <h2 className="text-6xl font-bold text-white">{Math.round(data.overall_score)}</h2>
            <span className="text-2xl text-slate-500">/100</span>
          </div>
          <p className="text-blue-400 mt-2 font-medium">Profile Match: {data.voice_profile}</p>
        </div>

        {/* 2. SCORE BREAKDOWN */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto z-10 flex-1 justify-end">
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 hover:border-blue-500/50 transition-colors">
            <p className="text-slate-400 text-xs uppercase mb-1 font-semibold tracking-wider">Pronunciation</p>
            <p className="text-3xl font-bold text-white mb-2">{Math.round(data.dimensions?.pronunciation || 0)}</p>
            <p className="text-xs text-slate-500">Word correctness</p>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 hover:border-purple-500/50 transition-colors">
            <p className="text-slate-400 text-xs uppercase mb-1 font-semibold tracking-wider">Intonation</p>
            <p className="text-3xl font-bold text-white mb-2">{Math.round(data.dimensions?.intonation || 0)}</p>
            <p className="text-xs text-slate-500">Pitch contour</p>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 hover:border-emerald-500/50 transition-colors">
            <p className="text-slate-400 text-xs uppercase mb-1 font-semibold tracking-wider">Fluency</p>
            <p className="text-3xl font-bold text-white mb-2">{Math.round(data.dimensions?.fluency || 0)}</p>
            <p className="text-xs text-slate-500">Speech rhythm</p>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 hover:border-amber-500/50 transition-colors">
            <p className="text-slate-400 text-xs uppercase mb-1 font-semibold tracking-wider">Clarity</p>
            <p className="text-3xl font-bold text-white mb-2">{Math.round(data.dimensions?.clarity || 0)}</p>
            <p className="text-xs text-slate-500">Articulation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. NATIVE COMPARISON */}
        <div className="lg:col-span-1 glass rounded-3xl p-6 border border-slate-700/50 flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <User size={20} className="text-blue-400" />
            Native Speaker Comparison
          </h3>
          <p className="text-sm text-slate-400 mb-6">Your speech pattern is acoustically closer to the Native {data.voice_profile} Reference.</p>
          
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                <BarXAxis type="number" domain={[0, 100]} hide />
                <BarYAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#cbd5e1', fontSize: 14}} width={100} />
                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. FEATURE INTERPRETATION */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-slate-700/50">
           <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Activity size={20} className="text-emerald-400" />
            Acoustic Feature Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                   <Activity size={16} className="text-purple-400" />
                   <span className="font-semibold text-slate-200">Pitch</span>
                </div>
                <p className="text-sm text-slate-400">Your average pitch ({Math.round(data.pitch?.mean || 0)} Hz) aligns well with the Native {data.voice_profile} Reference.</p>
             </div>
             
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                   <Volume2 size={16} className="text-blue-400" />
                   <span className="font-semibold text-slate-200">Energy</span>
                </div>
                <p className="text-sm text-slate-400">Your speech energy is clear and falls within expected native boundaries.</p>
             </div>
             
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                   <Clock size={16} className="text-amber-400" />
                   <span className="font-semibold text-slate-200">Pause Ratio</span>
                </div>
                <p className="text-sm text-slate-400">You use pauses for {(data.pause?.ratio * 100 || 0).toFixed(1)}% of your speech, showing natural rhythm.</p>
             </div>
             
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                   <Zap size={16} className="text-red-400" />
                   <span className="font-semibold text-slate-200">Speed</span>
                </div>
                <p className="text-sm text-slate-400">Your speaking rate is {Math.round(data.accent?.speaking_rate_wpm || 0)} words per minute.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 5. WORD ALIGNMENT & TIMELINE */}
        <div className="glass rounded-3xl p-6 border border-slate-700/50 flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <Mic size={20} className="text-blue-400" />
            Word Alignment & Timeline
          </h3>
          <p className="text-sm text-slate-400 mb-6">Select a word to view phoneme-level details.</p>
          
          <div className="flex flex-wrap gap-2 mb-6 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
            {data.pronunciation?.words?.length > 0 ? (
               data.pronunciation.words.map((word, i) => (
                 <button 
                   key={i} 
                   onClick={() => setSelectedWord(word)}
                   className={`px-4 py-2 rounded-lg font-medium transition-all ${
                     selectedWord?.word === word.word && selectedWord?.start === word.start 
                       ? 'ring-2 ring-blue-500 scale-105' 
                       : 'hover:bg-slate-700'
                   } ${
                     word.status === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-slate-800 text-slate-200 border border-slate-700'
                   }`}
                 >
                   {word.word}
                 </button>
               ))
            ) : (
               <p className="text-slate-500 text-sm">Word-level alignment is unavailable.</p>
            )}
          </div>

          {/* Words to improve section */}
          {data.pronunciation?.errors?.length > 0 && (
             <div className="mt-auto border-t border-slate-700/50 pt-4">
                <h4 className="text-slate-300 font-medium mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Words to Improve</h4>
                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                  {data.pronunciation.errors.map((err: any, i: number) => (
                    <div key={i} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex justify-between items-center">
                       <div>
                          <span className="font-semibold text-red-400">{err.word}</span>
                          <p className="text-xs text-slate-400 mt-1">{err.reason}</p>
                       </div>
                       <div className="text-right">
                          <span className="text-xs text-slate-500">Score</span>
                          <p className="text-sm font-bold text-white">{Math.round(err.score)}</p>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
          {data.pronunciation?.errors?.length === 0 && data.pronunciation?.words?.length > 0 && (
             <div className="mt-auto border-t border-slate-700/50 pt-4">
                <p className="text-emerald-400 text-sm flex items-center gap-2"><CheckCircle2 size={16} /> Great! No significant word-level pronunciation errors were detected.</p>
             </div>
          )}
        </div>

        {/* 6. PHONEME ANALYSIS FOR SELECTED WORD */}
        <div className="glass rounded-3xl p-6 border border-slate-700/50">
           <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <ListMusic size={20} className="text-purple-400" />
            Phoneme Analysis
          </h3>
          
          {selectedWord ? (
             <div>
                <div className="flex justify-between items-end mb-6 border-b border-slate-700/50 pb-4">
                   <div>
                     <p className="text-sm text-slate-400 mb-1">Selected Word</p>
                     <p className="text-3xl font-bold text-white">{selectedWord.word}</p>
                     <p className="text-xs text-slate-500 mt-1">{selectedWord.start.toFixed(2)}s — {selectedWord.end.toFixed(2)}s</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm text-slate-400 mb-1">Score</p>
                     <p className={`text-2xl font-bold ${selectedWord.status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {Math.round(selectedWord.score)}
                     </p>
                   </div>
                </div>
                
                {selectedPhonemes.length > 0 ? (
                   <div>
                      <p className="text-sm text-slate-400 mb-3">Detected Phonemes</p>
                      <div className="flex flex-wrap gap-2">
                         {selectedPhonemes.map((ph, i) => (
                            <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-lg min-w-[60px] border ${ph.score < 70 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800 border-slate-700'}`}>
                               <span className={`text-xl font-bold mb-1 ${ph.score < 80 ? 'text-amber-400' : 'text-slate-200'}`}>/{ph.symbol}/</span>
                               {ph.score < 80 ? (
                                  <div className="flex flex-col items-center">
                                    <AlertCircle size={14} className="text-amber-500 mb-1" />
                                    <span className="text-[10px] text-amber-500 text-center leading-tight max-w-[80px]">{ph.error_type?.replace(/_/g, ' ') || 'needs focus'}</span>
                                  </div>
                               ) : <CheckCircle2 size={14} className="text-emerald-500" />}
                            </div>
                         ))}
                      </div>
                   </div>
                ) : (
                   <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/30 text-center">
                      <p className="text-slate-500 text-sm">Phoneme-level analysis is unavailable for this word.</p>
                   </div>
                )}
             </div>
          ) : (
             <div className="h-full min-h-[200px] flex items-center justify-center text-slate-500 text-sm flex-col gap-3">
                <Mic size={32} className="opacity-20" />
                Select a word from the timeline to see its phonemes.
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 7. PITCH CONTOUR */}
        <div className="glass rounded-3xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <Music size={20} className="text-purple-400" />
            Pitch Contour (Intonation)
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            Your pitch contour is closest to the {data.intonation?.preferred_reference?.toLowerCase()} reference. Pattern: <span className="text-slate-200 font-medium">{data.intonation?.pattern}</span>, Ending: <span className="text-slate-200 font-medium">{data.intonation?.sentence_ending}</span>
          </p>
          <div className="h-64">
            {pitchContourData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pitchContourData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" tick={false} stroke="#64748b" />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Line name="You" type="monotone" dataKey="user" stroke="#f59e0b" strokeWidth={3} dot={false} connectNulls />
                  <Line name="Native Female" type="monotone" dataKey="female" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
                  <Line name="Native Male" type="monotone" dataKey="male" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">Pitch contour is unavailable for this recording.</div>
            )}
          </div>
        </div>

        {/* 8. FORMANT SCATTER (VOWEL SPACE) */}
        <div className="glass rounded-3xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <Activity size={20} className="text-orange-400" />
            Vowel Space (F1 vs F2)
          </h3>
          <p className="text-sm text-slate-400 mb-6">Analysis of your vowel articulation placements.</p>
          <div className="h-64">
             {formantData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                   <XAxis type="number" dataKey="f2" name="F2 (Backness)" reversed domain={['auto', 'auto']} stroke="#64748b" />
                   <YAxis type="number" dataKey="f1" name="F1 (Height)" reversed domain={['auto', 'auto']} stroke="#64748b" />
                   <ZAxis range={[100, 100]} />
                   <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                   <Scatter name="Your Voice" data={formantData} fill="#f97316">
                     <LabelList dataKey="name" position="top" fill="#94a3b8" fontSize={14} fontWeight="bold" />
                   </Scatter>
                 </ScatterChart>
               </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">Vowel formants could not be extracted.</div>
             )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* 9. ARTICULATION & ACCENT */}
         <div className="space-y-8">
            <div className="glass rounded-3xl p-6 border border-slate-700/50">
               <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                 <Mic size={20} className="text-teal-400" />
                 Articulation Quality
               </h3>
               <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full border-4 border-teal-500 flex items-center justify-center flex-shrink-0">
                     <span className="text-3xl font-bold text-white">{Math.round(data.articulation?.speech_clarity || 0)}</span>
                  </div>
                  <div>
                     <p className="text-lg font-medium text-slate-200 mb-1">
                        {data.articulation?.speech_clarity > 80 ? "Excellent Articulation" : data.articulation?.speech_clarity > 60 ? "Good Articulation" : "Needs Practice"}
                     </p>
                     <p className="text-sm text-slate-400">
                        {data.articulation?.speech_clarity > 75 
                           ? "Speech articulation is clear and consistent. Consonants and vowels are well separated." 
                           : "Some sounds blend together. Focus on speaking clearer and separating your words."}
                     </p>
                  </div>
               </div>
            </div>
            
            <div className="glass rounded-3xl p-6 border border-slate-700/50">
               <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                 <Activity size={20} className="text-indigo-400" />
                 Accent & Rhythm
               </h3>
               <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                  <p className="text-slate-300 leading-relaxed">
                     Speech rhythm tends to be {data.accent?.pause_ratio > 0.15 ? "slightly segmented" : "continuous"}, 
                     showing characteristics commonly associated with {data.accent?.accent_classification || "standard"} speech patterns.
                  </p>
               </div>
            </div>
         </div>

        {/* 10. AI TEACHER RECOMMENDATIONS */}
        <div className="glass rounded-3xl p-6 border border-slate-700/50 flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <ThumbsUp size={20} className="text-green-400" />
            AI Teacher
          </h3>
          
          <div className="space-y-4 flex-1">
             {data.recommendation && data.recommendation.length > 0 ? (
                <>
                   <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl">
                      <h4 className="text-emerald-400 font-medium mb-2 text-sm uppercase tracking-wider flex items-center gap-2"><CheckCircle2 size={16}/> What you're doing well</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                         {data.recommendation.find(r => r.type === "Strength")?.message || "Your articulation is clear and your overall speech rhythm is understandable."}
                      </p>
                   </div>
                   
                   <div className="bg-amber-900/10 border border-amber-500/20 p-4 rounded-xl">
                      <h4 className="text-amber-400 font-medium mb-2 text-sm uppercase tracking-wider flex items-center gap-2"><AlertTriangle size={16}/> What needs improvement</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                         {data.recommendation.find(r => r.type === "Needs Improvement")?.message || "Your pauses are longer than the native reference and your final vowel is less stable."}
                      </p>
                   </div>
                   
                   <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                      <h4 className="text-blue-400 font-medium mb-2 text-sm uppercase tracking-wider flex items-center gap-2"><MessageSquare size={16}/> How to practice</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">
                         {data.recommendation.find(r => r.type === "Feedback")?.message || "Repeat the sentence while reducing the pause before the final phrase. Maintain a slight pitch rise at the end of the question."}
                      </p>
                   </div>
                </>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                   AI feedback is unavailable.
                </div>
             )}
          </div>
        </div>
      </div>
      
      {/* 11. TECHNICAL DETAILS */}
      <div className="glass rounded-2xl border border-slate-700/50 overflow-hidden">
         <button 
            onClick={() => setShowTechnical(!showTechnical)}
            className="w-full p-6 flex justify-between items-center bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
         >
            <h3 className="text-lg font-semibold text-slate-300">Technical Details</h3>
            {showTechnical ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
         </button>
         
         {showTechnical && (
            <div className="p-6 border-t border-slate-700/50 bg-slate-900/50 grid grid-cols-2 md:grid-cols-4 gap-4">
               <div>
                  <p className="text-xs text-slate-500 mb-1">pitch_mean</p>
                  <p className="font-mono text-sm text-slate-300">{data.pitch?.mean?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 mb-1">energy_mean</p>
                  <p className="font-mono text-sm text-slate-300">{data.energy?.mean?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 mb-1">pause_ratio</p>
                  <p className="font-mono text-sm text-slate-300">{data.pause?.ratio?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 mb-1">speaking_rate</p>
                  <p className="font-mono text-sm text-slate-300">{data.accent?.speaking_rate_wpm?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 mb-1">f1_mean</p>
                  <p className="font-mono text-sm text-slate-300">{data.phonetics?.formants?.F1?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 mb-1">f2_mean</p>
                  <p className="font-mono text-sm text-slate-300">{data.phonetics?.formants?.F2?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500 mb-1">dtw_distance</p>
                  <p className="font-mono text-sm text-slate-300">{data.intonation?.similarity_score?.toFixed(4) || "N/A"}</p>
               </div>
            </div>
         )}
      </div>

    </div>
  );
}
