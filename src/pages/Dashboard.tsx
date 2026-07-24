import StatsCard from "../components/cards/StatsCard";
import DashboardLayout from "../components/layout/DashboardLayout";
import ChartView from "../components/cards/chartView";
import { useEffect, useState } from "react";
import { getFullDashboardAnalytics, getPhoneticDeviations } from "../api/analytics";
import { getUserProgress } from "../api/tasks";
import { FileAudio, GaugeCircle, Sparkles, TrendingUp, User, Clock, Brain, AlertTriangle, Medal, Flame, CheckCircle, Zap, Activity } from "lucide-react";

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [phonetics, setPhonetics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chartDimension, setChartDimension] = useState("overall");

    useEffect(() => {
        async function loadData() {
            try {
                const [fullData, userProgress, phoneticsData] = await Promise.all([
                    getFullDashboardAnalytics(),
                    getUserProgress(),
                    getPhoneticDeviations()
                ]);
                setData(fullData);
                setProgress(userProgress);
                setPhonetics(phoneticsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const chartData = data?.progress?.map((d: any) => ({
        date: d.date,
        score: d[chartDimension] || 0
    })) || [];

    const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : "-";
    const latestDate = chartData.length > 0 ? chartData[chartData.length - 1].date : "No analyses yet";

    // Calculate XP progress to next level
    const getLevelProgress = (xp: number, level: string) => {
        let max = 500;
        let min = 0;
        if (level === "Beginner") { min = 0; max = 500; }
        else if (level === "Elementary") { min = 500; max = 1500; }
        else if (level === "Intermediate") { min = 1500; max = 3000; }
        else if (level === "Advanced") { min = 3000; max = 6000; }
        else { min = 6000; max = 10000; }

        const percent = Math.min(100, Math.max(0, ((xp - min) / (max - min)) * 100));
        return { percent, max };
    };

    const levelInfo = progress ? getLevelProgress(progress.xp, progress.level) : { percent: 0, max: 500 };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="text-blue-500" />
                    Learning Dashboard
                </h1>
                <p className="text-slate-400">Track your pronunciation mastery and speech performance.</p>
            </div>

            {loading || !data ? (
                <div className="animate-pulse space-y-6">
                    <div className="h-32 glass rounded-3xl w-full"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-32 glass rounded-2xl p-6"></div>
                        ))}
                    </div>
                    <div className="h-[400px] glass rounded-2xl p-6"></div>
                </div>
            ) : (
                <>
                    {/* Gamification Bar */}
                    <div className="glass rounded-3xl p-6 mb-8 border border-slate-700/50 flex flex-col lg:flex-row gap-8 items-center justify-between">
                        {/* Level Info */}
                        <div className="flex items-center gap-4 flex-1 w-full">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                                <Medal size={32} className="text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium">Current Level</p>
                                        <h3 className="text-2xl font-bold text-white">{progress?.level}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-400 text-xs mb-1">XP to next level</p>
                                        <p className="text-blue-400 font-bold text-sm">{progress?.xp} / {levelInfo.max} XP</p>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000" style={{ width: `${levelInfo.percent}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Streaks & Tasks */}
                        <div className="flex gap-6 w-full lg:w-auto">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400">
                                    <Flame size={24} className={progress?.current_streak > 0 ? "text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" : ""} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Current Streak</p>
                                    <p className="text-xl font-bold text-white">{progress?.current_streak} Days</p>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Tasks Completed</p>
                                    <p className="text-xl font-bold text-white">{progress?.completed_tasks}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <StatsCard
                            title="Avg Pronunciation"
                            value={`${(data.summary?.avg_pronunciation?.toFixed(1) || 0)}`}
                            description="Accuracy score"
                            icon={<GaugeCircle size={24} />}
                        />
                        <StatsCard
                            title="Weekly Improvement"
                            value={`${data.summary?.weekly_improvement > 0 ? '+' : ''}${(data.summary?.weekly_improvement?.toFixed(1) || 0)}%`}
                            description="Compared to past 7 days"
                            icon={<TrendingUp size={24} className={data.summary?.weekly_improvement >= 0 ? "text-green-500" : "text-red-500"} />}
                        />
                        <StatsCard
                            title="Avg Similarity"
                            value={`${(data.summary?.avg_native_similarity?.toFixed(1) || 0)}%`}
                            description="Native speaker match"
                            icon={<User size={24} />}
                        />
                        <StatsCard
                            title="Avg Fluency"
                            value={`${(data.summary?.avg_fluency?.toFixed(1) || 0)}`}
                            description="Pacing & rhythm score"
                            icon={<Clock size={24} />}
                        />
                        <StatsCard
                            title="Total XP Earned"
                            value={`${progress?.xp || 0}`}
                            description="Keep practicing!"
                            icon={<Zap size={24} className="text-yellow-400" />}
                        />
                    </div>

                    <div className="glass rounded-2xl mt-8 p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative overflow-hidden">
                        <div className="lg:col-span-1 flex flex-col justify-center">
                            <h3 className="text-xl font-semibold text-white mb-4">Learning Trends</h3>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                Track your progress across multiple dimensions over time.
                            </p>

                            <div className="mb-6 flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-300">Select Dimension</label>
                                <select
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={chartDimension}
                                    onChange={(e) => setChartDimension(e.target.value)}
                                >
                                    <option value="overall">Overall Score</option>
                                    <option value="pronunciation">Pronunciation</option>
                                    <option value="fluency">Fluency</option>
                                    <option value="intonation">Intonation</option>
                                    <option value="clarity">Clarity</option>
                                </select>
                            </div>

                            <StatsCard
                                title={`Latest ${chartDimension.charAt(0).toUpperCase() + chartDimension.slice(1)}`}
                                value={typeof latestScore === 'number' ? `${latestScore.toFixed(1)}` : latestScore}
                                description={latestDate}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <ChartView data={chartData} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                        {/* AI Insight Card */}
                        <div className="glass rounded-2xl p-6 lg:col-span-1 border border-blue-500/20 flex flex-col h-full">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Brain className="text-blue-400" /> AI Coach Insight
                            </h3>
                            <div className="space-y-4 flex-1">
                                <div className="bg-slate-800/50 rounded-xl p-4 border-l-4 border-emerald-500">
                                    <h4 className="text-sm font-medium text-emerald-400 mb-1">Strength</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">{phonetics?.aiSummary || data.aiInsight?.strength || "Complete more tasks to see insights."}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border-l-4 border-amber-500">
                                    <h4 className="text-sm font-medium text-amber-400 mb-1">Needs Improvement</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">{data.aiInsight?.needs_improvement || "Complete more tasks to see insights."}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border-l-4 border-blue-500">
                                    <h4 className="text-sm font-medium text-blue-400 mb-1">Next Task Recommendation</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">{data.aiInsight?.recommendation || "Go to the Analyze page to start your first task."}</p>
                                </div>
                            </div>
                        </div>

                        {/* Error Analytics -> Phonetic Deviations */}
                        <div className="glass rounded-2xl p-6 lg:col-span-1 border border-slate-700/50">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Activity className="text-blue-400" /> Phonetic Deviations
                            </h3>

                            {!phonetics || (!phonetics.mostDifficultVowels?.length && !phonetics.mostDifficultConsonants?.length) ? (
                                <div className="text-center py-8">
                                    <AlertTriangle size={40} className="mx-auto text-slate-600 mb-3" />
                                    <p className="text-slate-400 text-sm">Complete more pronunciation tasks to unlock phonetic statistics.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Most Difficult Vowels */}
                                    {phonetics.mostDifficultVowels?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Most Difficult Vowels</h4>
                                            <div className="space-y-2">
                                                {phonetics.mostDifficultVowels.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center bg-slate-800/30 rounded-lg p-2 border border-red-500/20">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded">/{item.phoneme}/</span>
                                                            <span className="text-slate-300 text-sm">{item.accuracy}%</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-red-400">{item.mistakes} mistakes</p>
                                                            <p className="text-[10px] text-slate-500">{item.occurrences} total</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Most Difficult Consonants */}
                                    {phonetics.mostDifficultConsonants?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Most Difficult Consonants</h4>
                                            <div className="space-y-2">
                                                {phonetics.mostDifficultConsonants.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center bg-slate-800/30 rounded-lg p-2 border border-red-500/20">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded">/{item.phoneme}/</span>
                                                            <span className="text-slate-300 text-sm">{item.accuracy}%</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-red-400">{item.mistakes} mistakes</p>
                                                            <p className="text-[10px] text-slate-500">{item.occurrences} total</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Best Pronounced Sounds */}
                                    {phonetics.bestPronouncedSounds?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Best Pronounced Sounds</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {phonetics.bestPronouncedSounds.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-1.5 bg-emerald-500/10 rounded-full px-3 py-1 border border-emerald-500/20">
                                                        <span className="text-emerald-400 text-xs font-bold">/{item.phoneme}/</span>
                                                        <span className="text-slate-300 text-xs">{item.accuracy}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Achievement Statistics */}
                        <div className="glass rounded-2xl p-6 lg:col-span-1">
                            <h3 className="text-xl font-semibold text-white mb-4">Achievements</h3>
                            <div className="space-y-4">
                                {progress?.achievements?.length > 0 ? (
                                    progress.achievements.map((ach: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3 border border-amber-500/20">
                                            <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                                                <Medal size={16} className="text-amber-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium capitalize text-sm">{ach.replace(/_/g, " ")}</p>
                                                <p className="text-slate-400 text-xs">Unlocked</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Medal size={40} className="mx-auto text-slate-600 mb-2" />
                                        <p className="text-slate-400 text-sm">Complete tasks to unlock achievements.</p>
                                    </div>
                                )}

                                <div className="mt-6 border-t border-slate-700/50 pt-4">
                                    <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Milestones</h4>
                                    <div className="flex justify-between items-center bg-slate-800/30 rounded-lg p-3 mb-2">
                                        <span className="text-slate-400 text-sm">Total Practices</span>
                                        <span className="text-white font-bold">{progress?.history_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-800/30 rounded-lg p-3">
                                        <span className="text-slate-400 text-sm">Longest Streak</span>
                                        <span className="text-orange-400 font-bold">{progress?.longest_streak || 0} Days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}