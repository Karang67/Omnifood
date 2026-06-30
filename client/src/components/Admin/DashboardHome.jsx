import { useState, useEffect } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

const COLORS = ['#e23744', '#25c577', '#f1c40f', '#3498db', '#9b59b6'];

const DashboardHome = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch('/api/admin/dashboard-analytics');
                const data = await response.json();
                if (data.success) {
                    setAnalytics(data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#fff' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Dashboard Metrics...</div>
            </div>
        );
    }

    const stats = analytics?.stats || { totalUsers: 0, totalOrders: 0, totalRevenue: 0, activeRiders: 0, totalRiders: 0 };
    const chartData = analytics?.dailyOrders?.map(d => ({
        name: d._id,
        Orders: d.count,
        Revenue: d.revenue
    })) || [];

    const categoryData = analytics?.popularCategories?.map(c => ({
        name: c._id,
        value: c.count
    })) || [];

    const pieData = analytics?.statusBreakdown?.map(s => ({
        name: s._id,
        value: s.count
    })) || [];

    return (
        <div style={{ padding: '20px 0' }}>
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="mini-stat-card" style={{ background: 'rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4 style={{ color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Total Revenue</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#25c577', margin: '8px 0' }}>${(stats.totalRevenue).toFixed(2)}</div>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Total sales from customer orders.</span>
                </div>
                <div className="mini-stat-card" style={{ background: 'rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4 style={{ color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Orders Placed</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e23744', margin: '8px 0' }}>{stats.totalOrders}</div>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Gross lifetime orders count.</span>
                </div>
                <div className="mini-stat-card" style={{ background: 'rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4 style={{ color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Registered Customers</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '8px 0' }}>{stats.totalUsers}</div>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Accounts created on the platform.</span>
                </div>
                <div className="mini-stat-card" style={{ background: 'rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h4 style={{ color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Active Fleet riders</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1c40f', margin: '8px 0' }}>{stats.activeRiders} / {stats.totalRiders}</div>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Riders currently online on duty.</span>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '30px' }}>
                {/* Daily Revenue Area Chart */}
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ margin: '0 0 20px', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>Sales & Revenue Trends</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#25c577" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#25c577" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '0.85rem' }} />
                                <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '0.85rem' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                <Area type="monotone" dataKey="Revenue" stroke="#25c577" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Breakdown Pie Chart */}
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ margin: '0 0 20px', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>Order Status</h3>
                    <div style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Popular categories chart */}
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ margin: '0 0 20px', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>Items Distribution by Category</h3>
                <div style={{ height: '240px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '0.85rem' }} />
                            <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '0.85rem' }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#e23744" radius={[6, 6, 0, 0]}>
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
