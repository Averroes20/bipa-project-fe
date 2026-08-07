import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatsCard from "../components/cards/StatsCard";
import { getDatasetStatistics } from "../api/dataset";
import { FileAudio, Clock, Activity, Zap, PieChart as PieChartIcon } from "lucide-react";
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
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                    Dashboard
                </h1>
                <p className="text-slate-500 text-sm">Overview of your speech corpus dataset and acoustic statistics.</p>
            </div>

            {loading || !stats ? (
                <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl shadow-sm p-5"></div>
                        ))}
                    </div>
                    <div className="h-[400px] bg-white border border-slate-200 rounded-xl shadow-sm p-6"></div>
                </div>
            ) : (
                <>
                    {/* 6 Statistic Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Gender Distribution Pie Chart */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 flex flex-col h-[350px]">
                            <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase">Gender Distribution</h3>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.gender_stats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="count"
                                        >
                                            {stats.gender_stats?.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                                            itemStyle={{ color: '#0f172a' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '14px', color: '#64748b' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Acoustic Features Bar Chart */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 lg:col-span-2 h-[350px] flex flex-col">
                            <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase">
                                Acoustic Features by Gender
                            </h3>
                            <div className="flex-1 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={stats.gender_stats}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                                        {/* Pitch Axis */}
                                        <YAxis yAxisId="left" orientation="left" stroke="#64748b" axisLine={false} tickLine={false} />
                                        {/* Energy Axis */}
                                        <YAxis yAxisId="right" orientation="right" stroke="#64748b" axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '14px', color: '#64748b' }} />
                                        <Bar yAxisId="left" dataKey="pitch" name="Avg Pitch (Hz)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                        <Bar yAxisId="right" dataKey="energy" name="Avg Energy" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
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