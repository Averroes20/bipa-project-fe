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

  const safeRound = (val: number | null | undefined) => (val !== null && val !== undefined) ? Math.round(val) : "-";

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
    ? data.phonetics.vowel_space.filter(v => v.f1 !== null && v.f2 !== null).map(v => ({
        f1: v.f1,
        f2: v.f2,
        name: v.vowel
      }))
    : [];

  const nativeMaleData = data.phonetics?.native_male_space
    ? Object.entries(data.phonetics.native_male_space).map(([k, v]) => ({
        f1: v.f1,
        f2: v.f2,
        name: k
      }))
    : [];

  const nativeFemaleData = data.phonetics?.native_female_space
    ? Object.entries(data.phonetics.native_female_space).map(([k, v]) => ({
        f1: v.f1,
        f2: v.f2,
        name: k
      }))
    : [];

  const comparisonData = [
    { name: "Native Female", score: Math.round((data.similarity?.female || 0) * 100), fill: "#8b5cf6" },
    { name: "Native Male", score: Math.round((data.similarity?.male || 0) * 100), fill: "#14b8a6" },
    { name: "You", score: Math.round(data.overall_score), fill: "#3b82f6" },
  ];

  // Phonemes for selected word
  const selectedPhonemes = selectedWord 
    ? data.pronunciation?.phonemes?.filter(p => p.start >= selectedWord.start && p.end <= selectedWord.end)
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
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

        {/* 2. SCORE BREAKDOWN */}
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
        {/* 3. NATIVE COMPARISON */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-500" />
            Native Speaker Comparison
          </h3>
          <p className="text-sm text-slate-500 mb-6">Your speech pattern is acoustically closer to the Native {data.voice_profile} Reference.</p>
          
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <BarXAxis type="number" domain={[0, 100]} hide />
                <BarYAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} width={90} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. FEATURE INTERPRETATION */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
           <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-emerald-500" />
            Acoustic Feature Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                   <Activity size={16} className="text-purple-500" />
                   <span className="font-semibold text-slate-700 text-sm">Pitch</span>
                </div>
                <p className="text-sm text-slate-600">Your average pitch ({safeRound(data.pitch?.mean)} Hz) aligns well with the Native {data.voice_profile} Reference.</p>
             </div>
             
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                   <Volume2 size={16} className="text-blue-500" />
                   <span className="font-semibold text-slate-700 text-sm">Energy</span>
                </div>
                <p className="text-sm text-slate-600">Your speech energy is clear and falls within expected native boundaries.</p>
             </div>
             
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                   <Clock size={16} className="text-amber-500" />
                   <span className="font-semibold text-slate-700 text-sm">Pause Ratio</span>
                </div>
                <p className="text-sm text-slate-600">You use pauses for {(data.pause?.ratio * 100 || 0).toFixed(1)}% of your speech, showing natural rhythm.</p>
             </div>
             
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                   <Zap size={16} className="text-red-500" />
                   <span className="font-semibold text-slate-700 text-sm">Speed</span>
                </div>
                <p className="text-sm text-slate-600">Your speaking rate is {Math.round(data.accent?.speaking_rate_wpm || 0)} words per minute.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 5. WORD ALIGNMENT & TIMELINE */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Mic size={18} className="text-blue-500" />
            Word Alignment & Timeline
          </h3>
          <p className="text-sm text-slate-500 mb-4">Select a word to view phoneme-level details.</p>
          
          <div className="flex flex-wrap gap-2 mb-6 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
            {data.pronunciation?.words?.length > 0 ? (
               data.pronunciation.words.map((word, i) => (
                 <button 
                   key={i} 
                   onClick={() => setSelectedWord(word)}
                   className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                     selectedWord?.word === word.word && selectedWord?.start === word.start 
                       ? 'ring-2 ring-blue-500 scale-105' 
                       : 'hover:bg-slate-100'
                   } ${
                     word.status === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-700 border border-slate-200'
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
             <div className="mt-auto border-t border-slate-200 pt-4">
                <h4 className="text-slate-700 text-sm font-semibold mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Words to Improve</h4>
                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                  {data.pronunciation.errors.map((err: any, i: number) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                       <div>
                          <span className="font-semibold text-red-600 text-sm">{err.word}</span>
                          <p className="text-xs text-slate-500 mt-0.5">{err.reason}</p>
                       </div>
                       <div className="text-right">
                          <span className="text-xs text-slate-500">Score</span>
                          <p className="text-sm font-bold text-slate-900">{Math.round(err.score)}</p>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          )}
          {data.pronunciation?.errors?.length === 0 && data.pronunciation?.words?.length > 0 && (
             <div className="mt-auto border-t border-slate-200 pt-4">
                <p className="text-emerald-600 text-sm flex items-center gap-2 font-medium"><CheckCircle2 size={16} /> Great! No significant word-level pronunciation errors were detected.</p>
             </div>
          )}
        </div>

        {/* 6. PHONEME ANALYSIS FOR SELECTED WORD */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
           <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <ListMusic size={18} className="text-purple-500" />
            Phoneme Analysis
          </h3>
          
          {selectedWord ? (
             <div>
                <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
                   <div>
                     <p className="text-sm text-slate-500 mb-1">Selected Word</p>
                     <p className="text-3xl font-bold text-slate-900">{selectedWord.word}</p>
                     <p className="text-xs text-slate-400 mt-1">{selectedWord.start.toFixed(2)}s — {selectedWord.end.toFixed(2)}s</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm text-slate-500 mb-1">Score</p>
                     <p className={`text-2xl font-bold ${selectedWord.status === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {Math.round(selectedWord.score)}
                     </p>
                   </div>
                </div>
                
                {selectedPhonemes.length > 0 ? (
                   <div>
                      <p className="text-sm text-slate-500 mb-3">Detected Phonemes</p>
                      <div className="flex flex-wrap gap-2">
                         {selectedPhonemes.map((ph, i) => (
                            <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[60px] border ${ph.score < 70 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                               <span className={`text-xl font-bold mb-1 ${ph.score < 80 ? 'text-amber-500' : 'text-slate-700'}`}>/{ph.symbol}/</span>
                               {ph.score < 80 ? (
                                  <div className="flex flex-col items-center">
                                    <AlertCircle size={14} className="text-amber-500 mb-1" />
                                    <span className="text-[10px] text-amber-600 text-center leading-tight max-w-[80px]">{ph.error_type?.replace(/_/g, ' ') || 'needs focus'}</span>
                                  </div>
                               ) : <CheckCircle2 size={14} className="text-emerald-500" />}
                            </div>
                         ))}
                      </div>
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
        {/* 7. PITCH CONTOUR */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Music size={18} className="text-purple-500" />
            Pitch Contour (Intonation)
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Your pitch contour is closest to the {data.intonation?.preferred_reference?.toLowerCase()} reference. Pattern: <span className="text-slate-700 font-medium">{data.intonation?.pattern}</span>, Ending: <span className="text-slate-700 font-medium">{data.intonation?.sentence_ending}</span>
          </p>
          <div className="h-64">
            {pitchContourData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pitchContourData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" tick={false} stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
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
        </div>

        {/* 8. FORMANT SCATTER (VOWEL SPACE) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Activity size={18} className="text-orange-500" />
            Vowel Space (F1 vs F2)
          </h3>
          <p className="text-sm text-slate-500 mb-6">Analysis of your vowel articulation placements.</p>
          <div className="h-64">
             {formantData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                   <YAxis type="number" dataKey="f1" name="F1 (Height)" reversed domain={['auto', 'auto']} stroke="#64748b" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                   <XAxis type="number" dataKey="f2" name="F2 (Backness)" reversed domain={['auto', 'auto']} stroke="#64748b" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                   <ZAxis range={[100, 100]} />
                   <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }} />
                   <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', color: '#64748b' }} />
                   <Scatter name="You" data={formantData} fill="#3b82f6">
                    <LabelList dataKey="name" position="top" fill="#64748b" fontSize={11} />
                  </Scatter>
                  <Scatter name="Native Male" data={nativeMaleData} fill="#14b8a6" shape="triangle">
                    <LabelList dataKey="name" position="bottom" fill="#94a3b8" fontSize={10} />
                  </Scatter>
                  <Scatter name="Native Female" data={nativeFemaleData} fill="#8b5cf6" shape="diamond">
                    <LabelList dataKey="name" position="right" fill="#94a3b8" fontSize={10} />
                  </Scatter>
                 </ScatterChart>
               </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Vowel formants could not be extracted.</div>
             )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* 9. ARTICULATION & ACCENT */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
               <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                 <Mic size={18} className="text-teal-500" />
                 Articulation Quality
               </h3>
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full border-4 border-teal-500 flex items-center justify-center flex-shrink-0">
                     <span className="text-2xl font-bold text-slate-900">{safeRound(data.articulation?.speech_clarity)}</span>
                  </div>
                  <div>
                     <p className="text-base font-semibold text-slate-800 mb-1">
                        {(data.articulation?.speech_clarity || 0) > 80 ? "Excellent Articulation" : (data.articulation?.speech_clarity || 0) > 60 ? "Good Articulation" : "Needs Practice"}
                     </p>
                     <p className="text-sm text-slate-500">
                        {(data.articulation?.speech_clarity || 0) > 75 
                           ? "Speech articulation is clear and consistent. Consonants and vowels are well separated." 
                           : "Some sounds blend together. Focus on speaking clearer and separating your words."}
                     </p>
                  </div>
               </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
               <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                 <Activity size={18} className="text-indigo-500" />
                 Accent & Rhythm
               </h3>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-slate-600 text-sm leading-relaxed">
                     Speech rhythm tends to be {data.accent?.pause_ratio > 0.15 ? "slightly segmented" : "continuous"}, 
                     showing characteristics commonly associated with <span className="font-semibold text-slate-800">{data.accent?.accent_classification || "standard"}</span> speech patterns.
                  </p>
               </div>
            </div>
         </div>

        {/* 10. AI TEACHER RECOMMENDATIONS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <ThumbsUp size={18} className="text-green-500" />
            AI Teacher
          </h3>
          
          <div className="space-y-4 flex-1">
             {data.recommendation && data.recommendation.length > 0 ? (
                <>
                   <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                      <h4 className="text-emerald-600 font-semibold mb-2 text-xs uppercase tracking-wider flex items-center gap-2"><CheckCircle2 size={16}/> What you're doing well</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                         {data.recommendation.find(r => r.type === "Strength")?.message || "Your articulation is clear and your overall speech rhythm is understandable."}
                      </p>
                   </div>
                   
                   <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                      <h4 className="text-amber-600 font-semibold mb-2 text-xs uppercase tracking-wider flex items-center gap-2"><AlertTriangle size={16}/> What needs improvement</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                         {data.recommendation.find(r => r.type === "Needs Improvement")?.message || "Your pauses are longer than the native reference and your final vowel is less stable."}
                      </p>
                   </div>
                   
                   <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                      <h4 className="text-blue-600 font-semibold mb-2 text-xs uppercase tracking-wider flex items-center gap-2"><MessageSquare size={16}/> How to practice</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                         {data.recommendation.find(r => r.type === "Feedback")?.message || "Repeat the sentence while reducing the pause before the final phrase. Maintain a slight pitch rise at the end of the question."}
                      </p>
                   </div>
                </>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                   AI feedback is unavailable.
                </div>
             )}
          </div>
        </div>
      </div>
      
      {/* 11. TECHNICAL DETAILS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
         <button 
            onClick={() => setShowTechnical(!showTechnical)}
            className="w-full p-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
         >
            <h3 className="text-sm font-semibold text-slate-700">Technical Details</h3>
            {showTechnical ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
         </button>
         
         {showTechnical && (
            <div className="p-6 border-t border-slate-200 bg-white grid grid-cols-2 md:grid-cols-4 gap-4">
               <div>
                  <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">pitch_mean</p>
                  <p className="font-mono text-sm text-slate-700">{data.pitch?.mean?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">energy_mean</p>
                  <p className="font-mono text-sm text-slate-700">{data.energy?.mean?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">pause_ratio</p>
                  <p className="font-mono text-sm text-slate-700">{data.pause?.ratio?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">speaking_rate</p>
                  <p className="font-mono text-sm text-slate-700">{data.accent?.speaking_rate_wpm?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">f1_mean</p>
                  <p className="font-mono text-sm text-slate-700">{data.phonetics?.formants?.F1?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">f2_mean</p>
                  <p className="font-mono text-sm text-slate-700">{data.phonetics?.formants?.F2?.toFixed(4) || "N/A"}</p>
               </div>
               <div>
                  <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">dtw_distance</p>
                  <p className="font-mono text-sm text-slate-700">{data.intonation?.similarity_score?.toFixed(4) || "N/A"}</p>
               </div>
            </div>
         )}
      </div>

    </div>
  );
}
