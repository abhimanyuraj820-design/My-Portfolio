import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../../components/admin/Sidebar";
import API_BASE_URL from "../../config";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, Users, Globe, MonitorSmartphone, Menu, Clock, RefreshCw, Wifi, WifiOff, BarChart2 } from "lucide-react";

/* ─── Sub-components ─────────────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-[#1a1d2e] border border-[#252836] rounded-2xl p-6 flex justify-between items-start`}>
        <div>
            <p className="text-white/40 text-sm font-medium mb-1">{title}</p>
            <h2 className="text-3xl font-bold text-white">{value}</h2>
        </div>
        <div className={`${color} p-3 rounded-xl border`} style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Icon size={22} />
        </div>
    </div>
);

const EmptyChart = ({ message, sub }) => (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
        <BarChart2 size={32} className="text-white/10" />
        <p className="text-white/30 text-sm font-medium">{message}</p>
        {sub && <p className="text-white/20 text-xs max-w-xs">{sub}</p>}
    </div>
);

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#1a1d2e] border border-[#252836] rounded-xl p-3 shadow-xl text-xs">
            <p className="text-white/50 mb-2">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">
                    {p.name}: {p.value.toLocaleString()}
                </p>
            ))}
        </div>
    );
};

/* ─── Main Component ─────────────────────────────────────── */
const AnalyticsHub = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [days, setDays] = useState(30);
    const [data, setData] = useState({ traffic: [], deviceData: [], geoData: [], activeUsers: 0, totalViews: 0, totalUnique: 0 });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const activeInterval = useRef(null);
    const fullInterval = useRef(null);

    // Track online/offline
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
    }, []);

    const getHeaders = useCallback(() => {
        const token = localStorage.getItem('token');
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    }, []);

    // Lightweight active-user poll (every 30s)
    const fetchActive = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/analytics/active`, { headers: getHeaders() });
            if (res.ok) {
                const { activeUsers } = await res.json();
                setData(prev => ({ ...prev, activeUsers }));
            }
        } catch { /* silent */ }
    }, [getHeaders]);

    // Full data + logs refresh
    const fetchAll = useCallback(async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        try {
            const [analyticsRes, logsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/analytics?days=${days}`, { headers: getHeaders() }),
                fetch(`${API_BASE_URL}/api/systemLogs`, { headers: getHeaders() })
            ]);

            if (analyticsRes.ok) {
                const d = await analyticsRes.json();
                const formattedTraffic = (d.traffic || []).map(item => ({
                    ...item,
                    dateStr: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }));
                setData({
                    traffic: formattedTraffic,
                    deviceData: d.deviceData || [],
                    geoData: d.geoData || [],
                    activeUsers: d.activeUsers ?? 0,
                    totalViews: d.totalViews ?? 0,
                    totalUnique: d.totalUnique ?? 0,
                });
            }
            if (logsRes.ok) setLogs(await logsRes.json());
            setLastUpdated(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [days, getHeaders]);

    // On mount and days change: full fetch + set up intervals
    useEffect(() => {
        setLoading(true);
        fetchAll();

        // Clear previous intervals
        clearInterval(activeInterval.current);
        clearInterval(fullInterval.current);

        // Poll active users every 30s
        activeInterval.current = setInterval(fetchActive, 30_000);
        // Refresh full data every 60s
        fullInterval.current = setInterval(() => fetchAll(), 60_000);

        return () => {
            clearInterval(activeInterval.current);
            clearInterval(fullInterval.current);
        };
    }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

    const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

    const formatLogDate = (dateString) => {
        const date = new Date(dateString);
        const isToday = new Date().toDateString() === date.toDateString();
        return isToday
            ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const timeAgo = lastUpdated
        ? Math.round((Date.now() - lastUpdated.getTime()) / 1000) < 60
            ? `${Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago`
            : `${Math.round((Date.now() - lastUpdated.getTime()) / 60000)}m ago`
        : null;

    return (
        <div className="flex min-h-screen bg-[#0f1117]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 min-h-screen overflow-x-hidden relative">
                {/* Ambient Background Glows */}
                <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-4 p-4 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-white text-lg font-bold flex-1">Analytics Hub</h1>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-6 xl:p-8 text-white max-w-7xl mx-auto">
                    {/* Desktop Header */}
                    <div className="hidden md:flex justify-between items-center mb-8 flex-wrap gap-3">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white/90">Advanced Analytics</h1>
                            <p className="text-white/40 text-sm mt-1">Real-time traffic, audience and system activity</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Online indicator */}
                            <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium ${isOnline ? 'text-green-400 bg-green-400/10 border-green-500/30' : 'text-red-400 bg-red-400/10 border-red-500/30'}`}>
                                {isOnline ? <><Wifi size={12} /><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Live</> : <><WifiOff size={12} /> Offline</>}
                            </span>
                            {/* Range selector */}
                            <div className="flex rounded-lg border border-[#252836] overflow-hidden">
                                {[7, 30, 90].map(d => (
                                    <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${days === d ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>{d}d</button>
                                ))}
                            </div>
                            {/* Refresh */}
                            <button onClick={() => fetchAll(true)} disabled={refreshing} className="flex items-center gap-2 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-[#252836] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                                {timeAgo ? `Updated ${timeAgo}` : 'Refresh'}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" /></div>
                    ) : (
                        <div className="space-y-6">

                            {/* Top Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {/* Active Users — Live */}
                                <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <p className="text-violet-200/70 text-sm font-medium mb-1">Active Users</p>
                                            <h2 className="text-4xl md:text-5xl font-extrabold text-white flex items-baseline gap-2">
                                                {data.activeUsers}
                                                <span className="text-xs text-green-400 flex items-center bg-green-400/10 px-2 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse" /> Live
                                                </span>
                                            </h2>
                                            <p className="text-violet-300/40 text-xs mt-1">Last 15 min</p>
                                        </div>
                                        <div className="bg-violet-500/20 p-3 rounded-xl border border-violet-500/30">
                                            <Activity className="text-violet-400" size={24} />
                                        </div>
                                    </div>
                                </div>

                                <StatCard
                                    title={`Total Views (${days}d)`}
                                    value={data.totalViews.toLocaleString()}
                                    icon={Users}
                                    color="text-blue-400 border-blue-500/30"
                                />
                                <StatCard
                                    title="Top Region"
                                    value={data.geoData.length > 0 ? [...data.geoData].sort((a, b) => b.value - a.value)[0].name : '—'}
                                    icon={Globe}
                                    color="text-pink-400 border-pink-500/30"
                                />
                            </div>

                            {/* Traffic Chart */}
                            <div className="bg-[#1a1d2e] border border-[#252836] rounded-2xl p-4 md:p-6 w-full">
                                <h3 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-violet-400" /> Traffic ({days}d)
                                </h3>
                                <div className="h-[300px] md:h-[380px] w-full">
                                    {data.traffic.length === 0 ? (
                                        <EmptyChart message="No traffic data yet" sub="Data will appear here once visitors arrive at your site." />
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data.traffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="dateStr" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e42" vertical={false} />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Area type="monotone" dataKey="views" name="Views" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                                <Area type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Devices + Geography */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                {/* Device Donut */}
                                <div className="bg-[#1a1d2e] border border-[#252836] rounded-2xl p-4 md:p-6">
                                    <h3 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
                                        <MonitorSmartphone size={18} className="text-blue-400" /> Devices
                                    </h3>
                                    <div className="h-[250px] w-full flex items-center justify-center relative">
                                        {data.deviceData.length === 0 ? (
                                            <EmptyChart message="No device data yet" sub="Device breakdown appears after first tracked visit." />
                                        ) : (
                                            <>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={data.deviceData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                                            {data.deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ backgroundColor: '#161822', borderColor: '#252836', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute text-center pointer-events-none">
                                                    <p className="text-white/40 text-xs">Total</p>
                                                    <p className="text-xl font-bold text-white">{data.deviceData.reduce((a, b) => a + b.value, 0)}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Geography */}
                                <div className="bg-[#1a1d2e] border border-[#252836] rounded-2xl p-4 md:p-6">
                                    <h3 className="text-lg font-bold text-white/90 mb-4 flex items-center gap-2">
                                        <Globe size={18} className="text-emerald-400" /> Geography
                                    </h3>
                                    {data.geoData.length === 0 ? (
                                        <EmptyChart message="No geo data yet" sub="Geo tracking uses Vercel/Cloudflare IP headers — available in production, not in local development." />
                                    ) : (
                                        <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                                            {[...data.geoData].sort((a, b) => b.value - a.value).map((item, i) => {
                                                const max = Math.max(...data.geoData.map(d => d.value));
                                                return (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <span className="text-white/50 text-sm w-5 shrink-0">{i + 1}.</span>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-sm font-medium text-white/90">{item.name}</span>
                                                                <span className="text-xs text-white/40">{item.value} visits</span>
                                                            </div>
                                                            <div className="w-full bg-[#0f1117] rounded-full h-1.5 overflow-hidden">
                                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${(item.value / max) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* System Logs */}
                            <div className="bg-[#1a1d2e] border border-[#252836] rounded-2xl overflow-hidden mt-2">
                                <div className="p-4 md:p-6 border-b border-[#252836] bg-[#1a1d2e]/50 backdrop-blur-sm">
                                    <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
                                        <Clock size={18} className="text-orange-400" /> Recent Admin Actions
                                    </h3>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto w-full">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-[#161822] shadow-sm z-10">
                                            <tr>
                                                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-white/40 uppercase tracking-wider">Action</th>
                                                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">Details</th>
                                                <th className="py-3 px-4 md:px-6 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#252836]">
                                            {logs.length > 0 ? logs.map((log) => (
                                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-3 px-4 md:px-6 text-sm">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-medium bg-white/5 text-white/80 border border-white/10 whitespace-nowrap">{log.action}</span>
                                                    </td>
                                                    <td className="py-3 px-4 md:px-6 text-sm text-white/60 hidden sm:table-cell break-words max-w-xs">{log.details}</td>
                                                    <td className="py-3 px-4 md:px-6 text-sm text-white/40 text-right whitespace-nowrap">{formatLogDate(log.timestamp)}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="3" className="py-8 text-center text-white/40 text-sm">No recent activity found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsHub;