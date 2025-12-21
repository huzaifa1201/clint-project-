
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, limit, query, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

import { ShoppingBag, Package, Users, TrendingUp, Clock, AlertCircle, Loader2, Image as ImageIcon, Edit3, Activity, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Banner } from '../../types';
import { seedDatabase } from '../../utils/seedDb';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    users: 0,
    revenue: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [activeHero, setActiveHero] = useState<Banner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsSnap, usersSnap, ordersSnap, messagesSnap, bannersSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'users')),
          getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'), limit(5))),
          getDocs(query(collection(db, 'banners'), limit(1)))
        ]);

        const totalRevenue = ordersSnap.docs.reduce((acc, doc) => acc + Number(doc.data().totalPrice || 0), 0);

        setStats({
          orders: ordersSnap.size,
          products: productsSnap.size,
          users: usersSnap.size,
          revenue: totalRevenue
        });

        if (!bannersSnap.empty) {
          setActiveHero({ id: bannersSnap.docs[0].id, ...bannersSnap.docs[0].data() } as Banner);
        }

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          return d;
        }).reverse();

        const revenueMap: Record<number, number> = {};
        ordersSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.createdAt && data.totalPrice) {
            const date = data.createdAt.toDate();
            date.setHours(0, 0, 0, 0);
            const key = date.getTime();
            revenueMap[key] = (revenueMap[key] || 0) + Number(data.totalPrice);
          }
        });

        setChartData(last7Days.map(date => ({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: revenueMap[date.getTime()] || 0
        })));

        const orderLogs = ordersSnap.docs.slice(0, 3).map(d => ({
          type: 'ORDER',
          title: `Order #${d.id.slice(0, 5)} logged by ${d.data().userName}`,
          time: d.data().createdAt,
          color: 'text-green-500'
        }));

        const messageLogs = messagesSnap.docs.slice(0, 2).map(d => ({
          type: 'MESSAGE',
          title: `New transmission from ${d.data().name}`,
          time: d.data().createdAt,
          color: 'text-blue-500'
        }));

        const combinedLogs = [...orderLogs, ...messageLogs].sort((a, b) =>
          (b.time?.seconds || 0) - (a.time?.seconds || 0)
        );
        setRecentLogs(combinedLogs);

      } catch (e: any) {
        console.error("Dashboard error:", e);
        setError("Operational failure: Mission database access denied.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatTime = (ts: Timestamp) => {
    if (!ts) return 'Just now';
    const seconds = Math.floor((Timestamp.now().seconds - ts.seconds));
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 text-left">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Neon Ops Command</h1>
          <p className="text-zinc-500 font-medium">Global logistics and intelligence overview.</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to add 20 dummy products?")) {
                seedDatabase();
              }
            }}
            className="bg-green-500 text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            <Database size={16} /> Seed Asset Data
          </button>
          <Link to="/admin/banners" className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-green-500 hover:text-green-500 transition-all flex items-center gap-2">
            <Edit3 size={16} /> Recalibrate Visuals
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 text-red-500 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="shrink-0 mt-0.5" />
          <div className="space-y-1 text-left">
            <p className="font-bold">Access Protocols Failing</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Net Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Active Missions', value: stats.orders, icon: ShoppingBag, color: 'text-blue-500' },
          { label: 'Registered Citizens', value: stats.users, icon: Users, color: 'text-purple-500' },
          { label: 'Stored Assets', value: stats.products, icon: Package, color: 'text-orange-500' }
        ].map((item, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-left relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-green-500 transition-colors"></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-zinc-950 rounded-xl ${item.color}`}><item.icon size={24} /></div>
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</p>
            <h3 className="text-3xl font-black tracking-tighter">{loading ? '---' : item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[40px] p-10 text-left shadow-2xl">
            <h3 className="font-black italic uppercase tracking-tighter text-xl mb-8">Revenue Stream (7D)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#18181b' }} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visual Identity Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-[40px] p-10 text-left shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 text-zinc-800 opacity-20"><ImageIcon size={120} /></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="font-black italic uppercase tracking-tighter text-xl">Active Visual Identity</h3>
              <Link to="/admin/banners" className="text-xs font-black text-green-500 uppercase tracking-widest hover:underline">Change Hero</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="md:col-span-1 aspect-video md:aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                {activeHero ? (
                  <img src={activeHero.imageUrl} className="w-full h-full object-cover opacity-60" alt="Hero" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800"><ImageIcon size={48} /></div>
                )}
              </div>
              <div className="md:col-span-2 flex flex-col justify-center space-y-4">
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Live Headline</p>
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">
                    {activeHero?.title || 'No Headline Active'}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">LIVE ON FRONTEND</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[40px] p-10 text-left shadow-2xl">
          <h3 className="font-black italic uppercase tracking-tighter text-xl mb-8 flex items-center gap-2"><Clock size={20} className="text-green-500" /> Real-Time Intel</h3>
          <div className="space-y-8">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex gap-4 group">
                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.type === 'ORDER' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-500'}`}></div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-zinc-300 leading-tight group-hover:text-white transition-colors">{log.title}</p>
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{formatTime(log.time)}</p>
                </div>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-700 font-black italic uppercase text-xs">Awaiting data...</p>
              </div>
            )}
          </div>
          <Link to="/admin/orders" className="w-full mt-10 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-green-500 hover:border-green-500 transition-all flex items-center justify-center gap-2">
            Access Full Archives
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;