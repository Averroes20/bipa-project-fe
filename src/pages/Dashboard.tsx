import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatsCard from "../components/cards/StatsCard";
import { getDatasetStatistics } from "../api/dataset";
import { Database, FileAudio, Clock, Activity, Zap, PieChart as PieChartIcon, BarChart2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const COLORS = ['#3b82f6', '#ec4899']; // Blue for Male, Pink for Female

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getDatasetStatistics();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <Database className="text-blue-500" />
                    Corpus Dashboard
                </h1>
                <p className="text-slate-400">Overview of your speech corpus dataset and acoustic statistics.</p>
            </div>

            {loading || !stats ? (
                <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-32 glass rounded-2xl p-6 border border-slate-700/50"></div>
                        ))}
                    </div>
                    <div className="h-[400px] glass rounded-2xl p-6 border border-slate-700/50"></div>
                </div>
            ) : (
                <>
                    {/* 6 Statistic Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                        <StatsCard
                            title="Total Files"
                            value={stats.total_audio}
                            description="Audio records"
                            icon={<FileAudio size={24} />}
                        />
                        <StatsCard
                            title="Male Speakers"
                            value={stats.male_count}
                            description="Count"
                            icon={<PieChartIcon size={24} className="text-blue-400" />}
                        />
                        <StatsCard
                            title="Female Speakers"
                            value={stats.female_count}
                            description="Count"
                            icon={<PieChartIcon size={24} className="text-pink-400" />}
                        />
                        <StatsCard
                            title="Avg Duration"
                            value={`${stats.avg_duration?.toFixed(2)}s`}
                            description="Per file"
                            icon={<Clock size={24} />}
                        />
                        <StatsCard
                            title="Avg Pitch"
                            value={`${stats.avg_pitch?.toFixed(1)} Hz`}
                            description="F0 fundamental"
                            icon={<Activity size={24} className="text-indigo-400" />}
                        />
                        <StatsCard
                            title="Avg Energy"
                            value={`${stats.avg_energy?.toFixed(3)}`}
                            description="RMS Energy"
                            icon={<Zap size={24} className="text-yellow-400" />}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Gender Distribution Pie Chart */}
                        <div className="glass rounded-3xl p-6 border border-slate-700/50 flex flex-col h-[400px]">
                            <h3 className="text-xl font-bold text-white mb-6">Gender Distribution</h3>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.gender_stats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={5}
                                            dataKey="count"
                                        >
                                            {stats.gender_stats?.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Acoustic Features Bar Chart */}
                        <div className="glass rounded-3xl p-6 border border-slate-700/50 lg:col-span-2 h-[400px] flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <BarChart2 className="text-blue-500" /> Acoustic Features by Gender
                            </h3>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stats.gender_stats}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        {/* Pitch Axis */}
                                        <YAxis yAxisId="left" orientation="left" stroke="#818cf8" label={{ value: 'Pitch (Hz)', angle: -90, position: 'insideLeft', fill: '#818cf8' }} />
                                        {/* Energy Axis */}
                                        <YAxis yAxisId="right" orientation="right" stroke="#fbbf24" label={{ value: 'Energy', angle: 90, position: 'insideRight', fill: '#fbbf24' }} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="pitch" name="Avg Pitch (Hz)" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                        <Bar yAxisId="right" dataKey="energy" name="Avg Energy" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}